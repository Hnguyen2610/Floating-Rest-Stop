import { describe, expect, it } from 'vitest';
import { JournalSystem, type JournalData } from './JournalSystem';
import { GuestSystem, type GuestsData } from './GuestSystem';
import { EmotionSystem, type EmotionsData } from './EmotionSystem';
import { TypedEventBus, type GameEventMap } from '../core/EventBus';

const data: JournalData = {
  chapters: [
    {
      id: 'sun_chapter_1',
      guestId: 'sun',
      guestName: 'Sun',
      title: '01 First Visit',
      memories: [
        {
          id: 'sun_memory_1',
          diaryText: 'A quiet realization.',
          hint: 'Try soothing the sun guest',
          unlockedAtStage: 'SUN_CALMING'
        }
      ],
      requiredVisitCount: 1,
      requiredTrustLevel: 0,
      requiredSuccessfulTreatments: 0
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

function makeJournalSystem(journalData: JournalData = data) {
  const bus = new TypedEventBus<GameEventMap>();
  const guestSystem = new GuestSystem(guestsData, new EmotionSystem(emotionsData), bus);
  return { bus, system: new JournalSystem(journalData, bus, guestSystem), guestSystem };
}

describe('JournalSystem', () => {
  it('starts with every memory locked', () => {
    const { system } = makeJournalSystem();
    expect(system.isUnlocked('sun_memory_1')).toBe(false);
  });

  it('unlocks a memory and emits memory:unlocked', () => {
    const { bus, system } = makeJournalSystem();
    const received: unknown[] = [];
    bus.on('memory:unlocked', (payload) => received.push(payload));

    expect(system.unlockMemory('sun_memory_1')).toBe(true);
    expect(system.isUnlocked('sun_memory_1')).toBe(true);
    expect(received).toEqual([{ memoryId: 'sun_memory_1' }]);
  });

  it('returns false when unlocking an already-unlocked memory', () => {
    const { system } = makeJournalSystem();
    system.unlockMemory('sun_memory_1');
    expect(system.unlockMemory('sun_memory_1')).toBe(false);
  });

  it('throws when unlocking an unknown memory id', () => {
    const { system } = makeJournalSystem();
    expect(() => system.unlockMemory('ghost_memory')).toThrow();
  });

  it('can restore unlocked memories', () => {
    const { system } = makeJournalSystem();
    system.restoreUnlocked(['sun_memory_1']);
    expect(system.isUnlocked('sun_memory_1')).toBe(true);
  });

  it('can set and get journal item layout', () => {
    const { system } = makeJournalSystem();
    system.setJournalItemLayout('test_item', 'cloud', 100, 200, 45, 1.5);
    const layout = system.getJournalItemLayout('test_item');
    expect(layout).toEqual({ stickerType: 'cloud', x: 100, y: 200, rotation: 45, scale: 1.5 });
  });

  it('returns all journal layouts', () => {
    const { system } = makeJournalSystem();
    system.setJournalItemLayout('item1', 'cloud', 10, 20);
    system.setJournalItemLayout('item2', 'star', 30, 40);
    const layouts = system.getAllJournalLayouts();
    expect(layouts.size).toBe(2);
    expect(layouts.get('item1')).toEqual({ stickerType: 'cloud', x: 10, y: 20, rotation: 0, scale: 1 });
    expect(layouts.get('item2')).toEqual({ stickerType: 'star', x: 30, y: 40, rotation: 0, scale: 1 });
  });

  it('removes a journal item and emits journal:item-removed', () => {
    const { bus, system } = makeJournalSystem();
    const received: unknown[] = [];
    bus.on('journal:item-removed', (payload) => received.push(payload));

    system.setJournalItemLayout('item1', 'cloud', 10, 20);
    system.removeJournalItem('item1');

    expect(system.getJournalItemLayout('item1')).toBeUndefined();
    expect(received).toEqual([{ itemId: 'item1' }]);
  });

  it('can restore journal layouts from saved entries', () => {
    const { system } = makeJournalSystem();
    system.restoreJournalLayouts([['item1', { stickerType: 'cloud', x: 5, y: 6, rotation: 0, scale: 1 }]]);
    expect(system.getJournalItemLayout('item1')).toEqual({ stickerType: 'cloud', x: 5, y: 6, rotation: 0, scale: 1 });
  });

  it('gates chapter accessibility on visit count, trust, and successful treatments', () => {
    const { system, guestSystem } = makeJournalSystem();
    const chapter = data.chapters[0];

    expect(system.isChapterAccessible(chapter)).toBe(false);

    guestSystem.spawn('sun');
    expect(system.isChapterAccessible(chapter)).toBe(true);
  });

  it('auto-unlocks a memory when the guest reaches its bound stage within an accessible chapter', () => {
    const { system, guestSystem } = makeJournalSystem();
    guestSystem.spawn('sun'); // DISTRESSED; chapter is already accessible (requiredVisitCount: 1)
    expect(system.isUnlocked('sun_memory_1')).toBe(false);

    guestSystem.soothe(60); // 85 -> 25, CONTENT band -> currentEmotion becomes SUN_CALMING
    expect(system.isUnlocked('sun_memory_1')).toBe(true);
  });

  it('does not auto-unlock a stage-bound memory for a chapter that is not yet accessible', () => {
    const lockedData: JournalData = {
      chapters: [
        {
          id: 'sun_chapter_2',
          guestId: 'sun',
          guestName: 'Sun',
          title: '02 Later',
          requiredVisitCount: 5,
          memories: [
            { id: 'sun_memory_2', diaryText: '...', hint: '...', unlockedAtStage: 'SUN_CALMING' },
          ],
        },
      ],
    };
    const { system, guestSystem } = makeJournalSystem(lockedData);
    guestSystem.spawn('sun'); // visitCount 1, chapter requires 5 -> not accessible yet
    guestSystem.soothe(60); // reaches SUN_CALMING, but the chapter is still locked

    expect(system.isUnlocked('sun_memory_2')).toBe(false);
  });

  it('does not auto-unlock a memory that is meant to be unlocked by a photo moment', () => {
    const photoData: JournalData = {
      chapters: [
        {
          id: 'sun_chapter_photo',
          guestId: 'sun',
          guestName: 'Sun',
          title: '04 Resolution',
          requiredVisitCount: 1,
          memories: [
            {
              id: 'sun_memory_photo',
              diaryText: '...',
              hint: '...',
              // Stage matches on purpose: this proves the photoMomentId guard wins
              // even when the stage condition would otherwise also be satisfied.
              unlockedAtStage: 'SUN_RELAXED',
              photoMomentId: 'sun_cool_drizzle_01',
            },
          ],
        },
      ],
    };
    const { system, guestSystem } = makeJournalSystem(photoData);
    guestSystem.spawn('sun');
    guestSystem.soothe(85); // drives all the way to PEACEFUL

    expect(system.isUnlocked('sun_memory_photo')).toBe(false);
  });
});
