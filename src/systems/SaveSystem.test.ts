import { describe, expect, it, vi } from 'vitest';
import { SaveSystem } from './SaveSystem';
import type { SaveData, SaveProvider } from '../services/save/SaveProvider';
import { HappinessSystem } from './HappinessSystem';
import { StationAreaSystem, type AreasData } from './StationAreaSystem';
import { DecorationSystem, type DecorationsData } from './DecorationSystem';
import { GuestSystem, type GuestsData } from './GuestSystem';
import { EmotionSystem, type EmotionsData } from './EmotionSystem';
import { JournalSystem, type JournalData } from './JournalSystem';
import { PhotoMomentSystem, type PhotoMomentsData } from './PhotoMomentSystem';
import { PaperBoatSystem, type PaperMessagesData } from './PaperBoatSystem';
import { CloudyCosmeticsSystem, type CloudyCosmeticsData } from './CloudyCosmeticsSystem';
import { TutorialSystem } from './TutorialSystem';
import { AudioSystem } from './AudioSystem';
import { DayNightSystem } from './DayNightSystem';
import { RareWeatherSystem, type RareWeatherData } from './RareWeatherSystem';
import { WeatherSystem, type RecipesData } from './WeatherSystem';
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
const areasData: AreasData = {
  areas: [{ id: 'small_cloud', name: 'Small Cloud', cost: 0, order: 1 }],
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
const messagesData: PaperMessagesData = {
  messages: [{ id: 'did_well', text: 'You did well today.' }],
};
const cosmeticsData: CloudyCosmeticsData = {
  shapes: [{ id: 'default', name: 'Default', unlockedByDefault: true }],
  accessories: [{ id: 'sunset_hat', name: 'Sunset Hat' }],
};

const rareWeatherData: RareWeatherData = {
  events: [
    {
      id: 'meteor_shower',
      name: 'Meteor Shower',
      requiredAreaId: 'small_cloud',
      requiredGuestId: 'sun',
      requiredVisitCount: 1,
      visualEffect: 'comet',
      memoryId: 'sun_memory_1',
    },
  ],
};
const recipesData: RecipesData = {
  recipes: [{
    id: 'meteor_glow',
    name: 'Meteor Glow',
    ingredients: ['star_dust', 'rainbow_fragment'],
    visualEffect: 'meteor',
    suitableEmotions: [],
    suitableGuests: [],
    soothingValue: 0,
  }],
};

function makeSystems() {
  const bus = new TypedEventBus<GameEventMap>();
  const emotionSystem = new EmotionSystem(emotionsData);
  const guestSystem = new GuestSystem(guestsData, emotionSystem, bus);
  const happinessSystem = new HappinessSystem(bus);
  const stationAreaSystem = new StationAreaSystem(areasData, happinessSystem, bus);
  const decorationSystem = new DecorationSystem(decorationsData, happinessSystem, stationAreaSystem, bus);
  const journalSystem = new JournalSystem(journalData, bus, guestSystem);
  const photoMomentSystem = new PhotoMomentSystem(photoMomentsData, journalSystem, bus);
  const paperBoatSystem = new PaperBoatSystem(messagesData, happinessSystem, guestSystem, bus);
  const cloudyCosmeticsSystem = new CloudyCosmeticsSystem(cosmeticsData, happinessSystem, guestSystem, bus);
  const tutorialSystem = new TutorialSystem(bus);
  const audioSystem = new AudioSystem();
  const weatherSystem = new WeatherSystem(recipesData, bus);
  const rareWeatherSystem = new RareWeatherSystem(
    rareWeatherData,
    stationAreaSystem,
    guestSystem,
    new DayNightSystem(bus),
    journalSystem,
    bus,
  );
  return {
    bus,
    guestSystem,
    happinessSystem,
    stationAreaSystem,
    decorationSystem,
    journalSystem,
    photoMomentSystem,
    paperBoatSystem,
    cloudyCosmeticsSystem,
    tutorialSystem,
    audioSystem,
    rareWeatherSystem,
    weatherSystem,
  };
}

describe('SaveSystem', () => {
  it('gathers current state and writes it via the provider on saveNow()', async () => {
    const systems = makeSystems();
    systems.happinessSystem.collectCrystal();
    systems.happinessSystem.collectCrystal();
    systems.guestSystem.spawn('sun');
    systems.guestSystem.soothe(70); // 85 -> 15, CONTENT: leave() should gain trust
    systems.guestSystem.leave();
    systems.tutorialSystem.markWelcomeSeen();
    systems.weatherSystem.markRecipeDiscovered('meteor_glow');

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
    expect(provider.stored?.journalLayout).toEqual([]);
    // soothe() above crossed into CONTENT, which also fired guest:relaxed —
    // PaperBoatSystem listens for that too, so a message is already waiting.
    expect(provider.stored?.paperBoat).toEqual({ sentCount: 0, incomingMessageId: 'did_well', canSend: false });
    expect(provider.stored?.unlockedAreas).toEqual(['small_cloud']);
    expect(provider.stored?.cloudyCosmetics).toEqual({
      unlockedShapes: ['default'],
      unlockedAccessories: [],
      equippedShape: 'default',
      equippedAccessories: [],
    });
    expect(provider.stored?.hasSeenTutorial).toBe(true);
    expect(provider.stored?.tutorialStep).toBe('WAITING_FOR_GUEST');
    expect(provider.stored?.rareWeather).toEqual({ completedEventIds: [] });
    expect(provider.stored?.discoveredRecipeIds).toEqual(['meteor_glow']);
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
      journalLayout: [['sticker1', { stickerType: 'cloud', x: 10, y: 20, rotation: 0, scale: 1 }]],
      paperBoat: { sentCount: 4, incomingMessageId: null, canSend: true },
      unlockedAreas: ['tea_corner'],
      cloudyCosmetics: {
        unlockedShapes: ['heart'],
        unlockedAccessories: ['sunset_hat'],
        equippedShape: 'heart',
        equippedAccessories: ['sunset_hat'],
      },
      hasSeenTutorial: true,
      tutorialStep: 'DELIVER_WEATHER',
      rareWeather: { completedEventIds: ['meteor_shower'] },
      discoveredRecipeIds: ['meteor_glow'],
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
    expect(systems.journalSystem.getJournalItemLayout('sticker1')).toEqual({
      stickerType: 'cloud',
      x: 10,
      y: 20,
      rotation: 0,
      scale: 1,
    });
    expect(systems.paperBoatSystem.getSentCount()).toBe(4);
    expect(systems.paperBoatSystem.canSendNow()).toBe(true);
    expect(systems.stationAreaSystem.isUnlocked('tea_corner')).toBe(true);
    expect(systems.cloudyCosmeticsSystem.isShapeUnlocked('heart')).toBe(true);
    expect(systems.cloudyCosmeticsSystem.getEquippedShape()).toBe('heart');
    expect(systems.tutorialSystem.hasSeenWelcome()).toBe(true);
    // Mid-visit steps restart at the next guest (guest/potion are not saved).
    expect(systems.tutorialSystem.getStep()).toBe('WAITING_FOR_GUEST');
    expect(systems.rareWeatherSystem.isCompleted('meteor_shower')).toBe(true);
    expect(systems.weatherSystem.isRecipeDiscovered('meteor_glow')).toBe(true);
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
