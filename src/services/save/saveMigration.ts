import type {
  SaveData,
  GuestSaveEntry,
  PaperBoatSaveEntry,
  CloudyCosmeticsSaveEntry,
  AudioSettingsSave,
  TutorialStepSave,
} from './SaveProvider';

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

const TUTORIAL_STEPS: readonly TutorialStepSave[] = [
  'WAITING_FOR_GUEST',
  'FIND_INGREDIENT',
  'CRAFT_WEATHER',
  'DELIVER_WEATHER',
  'RUB_GUEST',
  'WATCH_EMOTION',
  'COMPLETE',
];

function normalizeTutorialStep(value: unknown): TutorialStepSave | undefined {
  return TUTORIAL_STEPS.find((step) => step === value);
}

// Only fields that are actually valid are kept — AudioSystem.restoreSettings()
// applies just the fields present, so an invalid one is left at its default
// rather than overwritten with junk (or with a guessed default duplicated here).
function normalizeAudioSettings(value: unknown): Partial<AudioSettingsSave> | undefined {
  if (!isObject(value)) return undefined;
  const result: Partial<AudioSettingsSave> = {};
  if (typeof value.muted === 'boolean') result.muted = value.muted;
  if (typeof value.masterVolume === 'number' && Number.isFinite(value.masterVolume)) {
    result.masterVolume = value.masterVolume;
  }
  if (isObject(value.busVolumes)) {
    const busVolumes: Record<string, number> = {};
    for (const [bus, volume] of Object.entries(value.busVolumes)) {
      if (typeof volume === 'number' && Number.isFinite(volume)) busVolumes[bus] = volume;
    }
    result.busVolumes = busVolumes;
  }
  return result;
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
  const normalized: SaveData = {
    version: CURRENT_VERSION,
    happinessCrystals: asNumber(data.happinessCrystals, 0),
    unlockedDecorations: asStringArray(data.unlockedDecorations),
    guestProgress: normalizeGuestProgress(data.guestProgress),
    unlockedMemories: asStringArray(data.unlockedMemories),
    capturedPhotoMoments: asStringArray(data.capturedPhotoMoments),
    journalLayout: normalizeJournalLayout(data.journalLayout),
    paperBoat: normalizePaperBoat(data.paperBoat),
    unlockedAreas: asStringArray(data.unlockedAreas),
    cloudyCosmetics: normalizeCloudyCosmetics(data.cloudyCosmetics),
    hasSeenTutorial: data.hasSeenTutorial === true,
  };

  if (data.tutorialStep !== undefined) normalized.tutorialStep = normalizeTutorialStep(data.tutorialStep);
  if (data.audioSettings !== undefined) normalized.audioSettings = normalizeAudioSettings(data.audioSettings);
  if (isObject(data.rareWeather)) {
    normalized.rareWeather = {
      completedEventIds: asStringArray(data.rareWeather.completedEventIds),
      lastCompletedVisitCounts: isObject(data.rareWeather.lastCompletedVisitCounts)
        ? Object.fromEntries(Object.entries(data.rareWeather.lastCompletedVisitCounts).map(([id, count]) => [id, asNumber(count, 0)]))
        : undefined,
    };
  }
  if (isObject(data.guestEmotionStages)) {
    normalized.guestEmotionStages = Object.fromEntries(
      Object.entries(data.guestEmotionStages).map(([id, stages]) => [id, asStringArray(stages)]),
    );
  }
  if (data.discoveredRecipeIds !== undefined) normalized.discoveredRecipeIds = asStringArray(data.discoveredRecipeIds);
  return normalized;
}
