import { describe, expect, it } from 'vitest';
import { PhotoMomentSystem, type PhotoMomentsData } from './PhotoMomentSystem';
import { JournalSystem, type JournalData } from './JournalSystem';
import { TypedEventBus, type GameEventMap } from '../core/EventBus';

const photoMomentsData: PhotoMomentsData = {
  photoMoments: [{ id: 'sun_cool_drizzle_01', guestId: 'sun', memoryId: 'sun_memory_1' }],
};

const journalData: JournalData = {
  chapters: [
    { guestId: 'sun', guestName: 'Sun', memories: [{ id: 'sun_memory_1', diaryText: '...' }] },
  ],
};

function makeSystem() {
  const bus = new TypedEventBus<GameEventMap>();
  const journalSystem = new JournalSystem(journalData, bus);
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
});
