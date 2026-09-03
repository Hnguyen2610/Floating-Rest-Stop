import { describe, expect, it } from 'vitest';
import { PhotoMomentSystem, type PhotoMomentsData } from './PhotoMomentSystem';
import { JournalSystem, type JournalData } from './JournalSystem';
import { GuestSystem, type GuestsData } from './GuestSystem';
import { EmotionSystem, type EmotionsData } from './EmotionSystem';
import { TypedEventBus, type GameEventMap } from '../core/EventBus';

const photoMomentsData: PhotoMomentsData = {
  photoMoments: [{ id: 'sun_cool_drizzle_01', guestId: 'sun', memoryId: 'sun_memory_1' }],
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

function makeSystem() {
  const bus = new TypedEventBus<GameEventMap>();
  const guestSystem = new GuestSystem(guestsData, new EmotionSystem(emotionsData), bus);
  const journalSystem = new JournalSystem(journalData, bus, guestSystem);
  const system = new PhotoMomentSystem(photoMomentsData, journalSystem, bus);
  return { bus, journalSystem, system };
}

describe('PhotoMomentSystem', () => {
  it('finds the photo moment defined for a guest', () => {
    const { system } = makeSystem();
    expect(system.getMomentForGuest('sun')?.id).toBe('sun_cool_drizzle_01');
    expect(system.getMomentForGuest('ghost')).toBeNull();
  });

  it('captures a moment, unlocking its journal memory and emitting photo:captured', () => {
    const { bus, journalSystem, system } = makeSystem();
    const captured: unknown[] = [];
    bus.on('photo:captured', (payload) => captured.push(payload));

    const memory = system.capture('sun');

    expect(memory?.photoMomentId).toBe('sun_cool_drizzle_01');
    expect(memory?.guestId).toBe('sun');
    expect(system.isCaptured('sun_cool_drizzle_01')).toBe(true);
    expect(journalSystem.isUnlocked('sun_memory_1')).toBe(true);
    expect(captured).toEqual([{ photoMomentId: 'sun_cool_drizzle_01', guestId: 'sun' }]);
  });

  it('refuses to capture the same moment twice', () => {
    const { system } = makeSystem();
    system.capture('sun');
    expect(system.capture('sun')).toBeNull();
  });

  it('returns null when capturing for a guest with no defined moment', () => {
    const { system } = makeSystem();
    expect(system.capture('ghost')).toBeNull();
  });

  it('does not capture (or unlock the memory) when the linked chapter is not yet accessible', () => {
    // Regression: sun_memory_1's chapter here requires a visit count the
    // fresh guest hasn't reached, so an early PEACEFUL visit must not be
    // able to spend the one-shot photo moment on it.
    const gatedJournalData: JournalData = {
      chapters: [
        {
          id: 'sun_chapter_resolution',
          guestId: 'sun',
          guestName: 'Sun',
          title: '04 Resolution',
          requiredVisitCount: 6,
          memories: [{ id: 'sun_memory_1', diaryText: '...', hint: 'soothe the sun' }],
        },
      ],
    };
    const bus = new TypedEventBus<GameEventMap>();
    const guestSystem = new GuestSystem(guestsData, new EmotionSystem(emotionsData), bus);
    const journalSystem = new JournalSystem(gatedJournalData, bus, guestSystem);
    const system = new PhotoMomentSystem(photoMomentsData, journalSystem, bus);
    guestSystem.spawn('sun'); // visitCount 1, chapter requires 6

    expect(system.capture('sun')).toBeNull();
    expect(system.isCaptured('sun_cool_drizzle_01')).toBe(false);
    expect(journalSystem.isUnlocked('sun_memory_1')).toBe(false);
  });
});
