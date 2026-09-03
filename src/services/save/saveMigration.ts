import type { SaveData, GuestSaveEntry, PaperBoatSaveEntry, CloudyCosmeticsSaveEntry } from './SaveProvider';

const CURRENT_VERSION = 1;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function normalizeGuestEntry(value: unknown): GuestSaveEntry {
  const raw = isObject(value) ? value : {};
  return {
    visitCount: asNumber(raw.visitCount, 0),
    trustLevel: asNumber(raw.trustLevel, 0),
    successfulTreatments: asNumber(raw.successfulTreatments, 0),
    memoryProgress: Array.isArray(raw.memoryProgress) ? (raw.memoryProgress as Array<[string, number]>) : [],
    specialInteractions: asNumber(raw.specialInteractions, 0),
  };
}

function normalizeGuestProgress(value: unknown): Record<string, GuestSaveEntry> {
  if (!isObject(value)) return {};
  const result: Record<string, GuestSaveEntry> = {};
  for (const [guestId, entry] of Object.entries(value)) {
    result[guestId] = normalizeGuestEntry(entry);
  }
  return result;
}

function normalizeJournalLayout(value: unknown): SaveData['journalLayout'] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (entry): entry is [string, SaveData['journalLayout'][number][1]] =>
      Array.isArray(entry) && entry.length === 2 && typeof entry[0] === 'string' && isObject(entry[1]),
  );
}

function normalizePaperBoat(value: unknown): PaperBoatSaveEntry {
  const raw = isObject(value) ? value : {};
  return {
    sentCount: asNumber(raw.sentCount, 0),
    incomingMessageId: typeof raw.incomingMessageId === 'string' ? raw.incomingMessageId : null,
    canSend: raw.canSend === true,
  };
}

function normalizeCloudyCosmetics(value: unknown): CloudyCosmeticsSaveEntry {
  const raw = isObject(value) ? value : {};
  return {
    unlockedShapes: asStringArray(raw.unlockedShapes),
    unlockedAccessories: asStringArray(raw.unlockedAccessories),
    equippedShape: typeof raw.equippedShape === 'string' ? raw.equippedShape : 'default',
    equippedAccessories: asStringArray(raw.equippedAccessories),
  };
}

/**
 * Pass 30: every field is filled in with a safe default rather than trusting
 * the loaded JSON shape — handles a genuinely missing/corrupted save, a
 * partial save from an older build (fields added in later passes simply
 * won't exist yet), or a save with the wrong types in some field. Called
 * once, right after `SaveProvider.load()`, so every other system only ever
 * sees a fully-formed SaveData and never has to defend against `undefined`.
 *
 * There's only ever been schema version 1 so far — if a future version
 * needs an actual data transform (not just filling in a default), that step
 * goes here, keyed off `raw.version`, before the field-by-field normalize
 * below runs.
 */
export function normalizeSaveData(raw: unknown): SaveData {
  const data = isObject(raw) ? raw : {};

  return {
    version: CURRENT_VERSION,
    happinessCrystals: asNumber(data.happinessCrystals, 0),
    unlockedDecorations: asStringArray(data.unlockedDecorations),
    guestProgress: normalizeGuestProgress(data.guestProgress),
    unlockedMemories: asStringArray(data.unlockedMemories),
    capturedPhotoMoments: asStringArray(data.capturedPhotoMoments),
    journalLayout: normalizeJournalLayout(data.journalLayout),
    paperBoat: normalizePaperBoat(data.paperBoat),
    unlockedAreas: asStringArray(data.unlockedAreas),
    isNight: data.isNight === true,
    cloudyCosmetics: normalizeCloudyCosmetics(data.cloudyCosmetics),
  };
}
