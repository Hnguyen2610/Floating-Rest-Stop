import { describe, expect, it, vi } from 'vitest';
import { SaveSystem } from './SaveSystem';
import type { SaveData, SaveProvider } from '../services/save/SaveProvider';
import { HappinessSystem } from './HappinessSystem';
import { DecorationSystem, type DecorationsData } from './DecorationSystem';
import { GuestSystem, type GuestsData } from './GuestSystem';
import { EmotionSystem, type EmotionsData } from './EmotionSystem';
import { JournalSystem, type JournalData } from './JournalSystem';
import { PhotoMomentSystem, type PhotoMomentsData } from './PhotoMomentSystem';
import { TypedEventBus, type GameEventMap } from '../core/EventBus';

class MemorySaveProvider implements SaveProvider {
  stored: SaveData | null = null;
  async load(): Promise<SaveData | null> {
    return this.stored;
  }
  async save(data: SaveData): Promise<void> {
    this.stored = data;
  }
}

const guestsData: GuestsData = {
  guests: [
    {
      id: 'sun',
      name: 'Sun',
      initialEmotion: 'SUN_OVERHEATED',
      initialIntensity: 85,
      treatment: { type: 'recipe', recipeId: 'cool_drizzle' },
      needHint: 'needs a cool drizzle',
    },
  ],
};
const emotionsData: EmotionsData = {
  stageThresholds: { distressed: 70, calming: 50, relaxed: 30, content: 10, peaceful: 0 },
  emotions: { SUN_OVERHEATED: { label: 'Overheated', color: '#f28b82' } },
};
const decorationsData: DecorationsData = {
  decorations: [
    { id: 'wind_chime', name: 'Wind Chime', cost: 1, slotX: 0.1, slotY: 0.1, interactive: true },
  ],
};
const journalData: JournalData = {
  chapters: [
    {
      id: 'sun_chapter_1',
      guestId: 'sun',
      guestName: 'Sun',
      title: '01 First Visit',
      memories: [{ id: 'sun_memory_1', diaryText: '...', hint: 'soothe the sun' }],
    },
  ],
};
const photoMomentsData: PhotoMomentsData = {
  photoMoments: [{ id: 'sun_cool_drizzle_01', guestId: 'sun', memoryId: 'sun_memory_1' }],
};

function makeSystems() {
  const bus = new TypedEventBus<GameEventMap>();
  const emotionSystem = new EmotionSystem(emotionsData);
  const guestSystem = new GuestSystem(guestsData, emotionSystem, bus);
  const happinessSystem = new HappinessSystem(bus);
  const decorationSystem = new DecorationSystem(decorationsData, happinessSystem, bus);
  const journalSystem = new JournalSystem(journalData, bus, guestSystem);
  const photoMomentSystem = new PhotoMomentSystem(photoMomentsData, journalSystem, bus);
  return { bus, guestSystem, happinessSystem, decorationSystem, journalSystem, photoMomentSystem };
}

describe('SaveSystem', () => {
  it('gathers current state and writes it via the provider on saveNow()', async () => {
    const systems = makeSystems();
    systems.happinessSystem.collectCrystal();
    systems.happinessSystem.collectCrystal();
    systems.guestSystem.spawn('sun');
    systems.guestSystem.soothe(70); // 85 -> 15, CONTENT: leave() should gain trust
    systems.guestSystem.leave();

    const provider = new MemorySaveProvider();
    const saveSystem = new SaveSystem(provider, systems, systems.bus);
    await saveSystem.whenReady();
    await saveSystem.saveNow();

    expect(provider.stored?.happinessCrystals).toBe(2);
    expect(provider.stored?.guestProgress.sun).toEqual({
      visitCount: 1,
      trustLevel: 8,
      successfulTreatments: 1,
      memoryProgress: [],
      specialInteractions: 0,
    });
  });

  it('restores state from an existing save on construction', async () => {
    const provider = new MemorySaveProvider();
    provider.stored = {
      version: 1,
      happinessCrystals: 5,
      unlockedDecorations: ['wind_chime'],
      guestProgress: {
        sun: { visitCount: 3, trustLevel: 16, successfulTreatments: 2, memoryProgress: [], specialInteractions: 0 },
      },
      unlockedMemories: ['sun_memory_1'],
      capturedPhotoMoments: ['sun_cool_drizzle_01'],
    };

    const systems = makeSystems();
    const saveSystem = new SaveSystem(provider, systems, systems.bus);
    await saveSystem.whenReady();

    expect(systems.happinessSystem.getCount()).toBe(5);
    expect(systems.decorationSystem.isUnlocked('wind_chime')).toBe(true);
    expect(systems.journalSystem.isUnlocked('sun_memory_1')).toBe(true);
    expect(systems.photoMomentSystem.isCaptured('sun_cool_drizzle_01')).toBe(true);
    expect(systems.guestSystem.getProgress('sun')).toEqual({
      visitCount: 3,
      trustLevel: 16,
      successfulTreatments: 2,
      memoryProgress: new Map(),
      specialInteractions: 0,
    });
  });

  it('does not save before the initial load resolves', async () => {
    const systems = makeSystems();
    const provider = new MemorySaveProvider();
    const loadSpy = vi.spyOn(provider, 'load');
    const saveSystem = new SaveSystem(provider, systems, systems.bus);

    const savePromise = saveSystem.saveNow();
    expect(loadSpy).toHaveBeenCalledTimes(1);
    await savePromise;
    expect(provider.stored).not.toBeNull();
  });
});
