import { describe, expect, it } from 'vitest';
import { normalizeSaveData } from './saveMigration';

describe('normalizeSaveData', () => {
  it('returns a fully-formed default save for null/undefined input (no save yet)', () => {
    expect(normalizeSaveData(null)).toEqual({
      version: 1,
      happinessCrystals: 0,
      unlockedDecorations: [],
      guestProgress: {},
      unlockedMemories: [],
      capturedPhotoMoments: [],
      journalLayout: [],
      paperBoat: { sentCount: 0, incomingMessageId: null, canSend: false },
      unlockedAreas: [],
      isNight: false,
      cloudyCosmetics: { unlockedShapes: [], unlockedAccessories: [], equippedShape: 'default', equippedAccessories: [] },
    });
    expect(normalizeSaveData(undefined)).toEqual(normalizeSaveData(null));
  });

  it('returns the same default for non-object garbage input (corrupted save)', () => {
    expect(normalizeSaveData('not an object')).toEqual(normalizeSaveData(null));
    expect(normalizeSaveData(42)).toEqual(normalizeSaveData(null));
    expect(normalizeSaveData([1, 2, 3])).toEqual(normalizeSaveData(null));
  });

  it('fills in missing fields from a partial save (older build, fields added later)', () => {
    const partial = { happinessCrystals: 12, unlockedDecorations: ['wind_chime'] };
    const result = normalizeSaveData(partial);

    expect(result.happinessCrystals).toBe(12);
    expect(result.unlockedDecorations).toEqual(['wind_chime']);
    expect(result.paperBoat).toEqual({ sentCount: 0, incomingMessageId: null, canSend: false });
    expect(result.unlockedAreas).toEqual([]);
    expect(result.cloudyCosmetics.equippedShape).toBe('default');
  });

  it('discards fields with the wrong type instead of propagating them (invalid values)', () => {
    const invalid = {
      happinessCrystals: 'twelve',
      unlockedDecorations: 'wind_chime', // should be an array
      isNight: 'yes', // should be a boolean
      paperBoat: { sentCount: 'four', canSend: 'true' },
    };
    const result = normalizeSaveData(invalid);

    expect(result.happinessCrystals).toBe(0);
    expect(result.unlockedDecorations).toEqual([]);
    expect(result.isNight).toBe(false);
    expect(result.paperBoat).toEqual({ sentCount: 0, incomingMessageId: null, canSend: false });
  });

  it('normalizes guest progress entries, filling defaults for any missing sub-fields', () => {
    const raw = {
      guestProgress: {
        sun: { visitCount: 3, trustLevel: 16 }, // missing successfulTreatments/memoryProgress/specialInteractions
        moon: 'not an object',
      },
    };
    const result = normalizeSaveData(raw);

    expect(result.guestProgress.sun).toEqual({
      visitCount: 3,
      trustLevel: 16,
      successfulTreatments: 0,
      memoryProgress: [],
      specialInteractions: 0,
    });
    expect(result.guestProgress.moon).toEqual({
      visitCount: 0,
      trustLevel: 0,
      successfulTreatments: 0,
      memoryProgress: [],
      specialInteractions: 0,
    });
  });

  it('always stamps the current schema version regardless of what the save claims (future/unknown version)', () => {
    const fromTheFuture = { version: 99, happinessCrystals: 5 };
    expect(normalizeSaveData(fromTheFuture).version).toBe(1);
    expect(normalizeSaveData(fromTheFuture).happinessCrystals).toBe(5);
  });

  it('passes a well-formed save through unchanged', () => {
    const wellFormed = {
      version: 1,
      happinessCrystals: 7,
      unlockedDecorations: ['wind_chime'],
      guestProgress: { sun: { visitCount: 2, trustLevel: 8, successfulTreatments: 1, memoryProgress: [['sun_memory_1', 1]], specialInteractions: 0 } },
      unlockedMemories: ['sun_memory_1'],
      capturedPhotoMoments: [],
      journalLayout: [['sticker1', { stickerType: 'cloud', x: 1, y: 2, rotation: 0, scale: 1 }]],
      paperBoat: { sentCount: 2, incomingMessageId: 'did_well', canSend: false },
      unlockedAreas: ['small_cloud'],
      isNight: true,
      cloudyCosmetics: { unlockedShapes: ['default', 'heart'], unlockedAccessories: [], equippedShape: 'heart', equippedAccessories: [] },
    };

    expect(normalizeSaveData(wellFormed)).toEqual(wellFormed);
  });
});
