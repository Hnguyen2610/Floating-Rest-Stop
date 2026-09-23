import { describe, expect, it } from 'vitest';
import { RareGuestSystem } from './RareGuestSystem';
import { GuestSystem, type GuestsData } from './GuestSystem';
import { EmotionSystem, type EmotionsData } from './EmotionSystem';
import { DecorationSystem, type DecorationsData } from './DecorationSystem';
import { StationAreaSystem, type AreasData } from './StationAreaSystem';
import { JournalSystem, type JournalData } from './JournalSystem';
import { DayNightSystem } from './DayNightSystem';
import { HappinessSystem } from './HappinessSystem';
import { TypedEventBus, type GameEventMap } from '../core/EventBus';

const guestsData: GuestsData = {
  guests: [
    {
      id: 'moon',
      name: 'Moon',
      initialEmotion: 'MOON_LONELY',
      initialIntensity: 85,
      treatment: { type: 'recipe', recipeId: 'starry_lullaby' },
      needHint: 'needs a lullaby',
    },
  ],
};
const emotionsData: EmotionsData = {
  stageThresholds: { distressed: 70, calming: 50, relaxed: 30, content: 10, peaceful: 0 },
  emotions: { MOON_LONELY: { label: 'Lonely', color: '#6b7fb0' } },
};
const decorationsData: DecorationsData = {
  decorations: [{ id: 'wind_chime', name: 'Wind Chime', cost: 1, slotX: 0.1, slotY: 0.1, interactive: true }],
};
const areasData: AreasData = {
  areas: [{ id: 'wind_garden', name: 'Wind Garden', cost: 10, order: 1 }],
};
const journalData: JournalData = {
  chapters: [
    {
      id: 'moon_chapter_3',
      guestId: 'moon',
      guestName: 'Moon',
      title: '03',
      memories: [{ id: 'moon_memory_3', diaryText: '...', hint: '...' }],
    },
    {
      id: 'star_chapter_4',
      guestId: 'little_star',
      guestName: 'Star',
      title: '04',
      memories: [{ id: 'star_memory_4', diaryText: '...', hint: '...' }],
    },
  ],
};

function makeSystem() {
  const bus = new TypedEventBus<GameEventMap>();
  const happinessSystem = new HappinessSystem(bus);
  const guestSystem = new GuestSystem(guestsData, new EmotionSystem(emotionsData), bus);
  const stationAreaSystem = new StationAreaSystem(areasData, happinessSystem, bus);
  const decorationSystem = new DecorationSystem(decorationsData, happinessSystem, stationAreaSystem, bus);
  const journalSystem = new JournalSystem(journalData, bus, guestSystem);
  const dayNightSystem = new DayNightSystem(bus);
  const rareGuestSystem = new RareGuestSystem(
    guestSystem,
    decorationSystem,
    stationAreaSystem,
    journalSystem,
    dayNightSystem,
  );
  return { happinessSystem, guestSystem, decorationSystem, stationAreaSystem, journalSystem, dayNightSystem, rareGuestSystem };
}

describe('RareGuestSystem', () => {
  it('Aurora is unavailable until every condition is met', () => {
    const { rareGuestSystem } = makeSystem();
    expect(rareGuestSystem.isAuroraAvailable()).toBe(false);
  });

  it('Aurora becomes available once trust, night, wind chime, and memory all line up', () => {
    const { happinessSystem, guestSystem, decorationSystem, journalSystem, dayNightSystem, rareGuestSystem } = makeSystem();

    guestSystem.addTrust('moon', 40);
    expect(rareGuestSystem.isAuroraAvailable()).toBe(false);

    dayNightSystem.debugCycleOverride(); // -> night
    expect(rareGuestSystem.isAuroraAvailable()).toBe(false);

    happinessSystem.collectCrystal();
    decorationSystem.unlock('wind_chime');
    expect(rareGuestSystem.isAuroraAvailable()).toBe(false);

    journalSystem.unlockMemory('moon_memory_3');
    expect(rareGuestSystem.isAuroraAvailable()).toBe(true);
  });

  it('Comet is unavailable until Star is resolved and Wind Garden is unlocked', () => {
    const { happinessSystem, journalSystem, stationAreaSystem, rareGuestSystem } = makeSystem();
    expect(rareGuestSystem.isCometAvailable()).toBe(false);

    journalSystem.unlockMemory('star_memory_4');
    expect(rareGuestSystem.isCometAvailable()).toBe(false);

    for (let i = 0; i < 10; i += 1) happinessSystem.collectCrystal();
    stationAreaSystem.unlock('wind_garden');
    expect(rareGuestSystem.isCometAvailable()).toBe(true);
  });
});
