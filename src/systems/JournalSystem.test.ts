import { describe, expect, it } from 'vitest';
import { JournalSystem, type JournalData } from './JournalSystem';
import { TypedEventBus, type GameEventMap } from '../core/EventBus';

const data: JournalData = {
  chapters: [
    {
      guestId: 'sun',
      guestName: 'Sun',
      memories: [{ id: 'sun_memory_1', diaryText: 'A quiet realization.' }],
    },
  ],
};

describe('JournalSystem', () => {
  it('starts with every memory locked', () => {
    const bus = new TypedEventBus<GameEventMap>();
    const system = new JournalSystem(data, bus);
    expect(system.isUnlocked('sun_memory_1')).toBe(false);
  });

  it('unlocks a memory and emits memory:unlocked', () => {
    const bus = new TypedEventBus<GameEventMap>();
    const system = new JournalSystem(data, bus);
    const received: unknown[] = [];
    bus.on('memory:unlocked', (payload) => received.push(payload));

    expect(system.unlockMemory('sun_memory_1')).toBe(true);
    expect(system.isUnlocked('sun_memory_1')).toBe(true);
    expect(received).toEqual([{ memoryId: 'sun_memory_1' }]);
  });

  it('returns false when unlocking an already-unlocked memory', () => {
    const bus = new TypedEventBus<GameEventMap>();
    const system = new JournalSystem(data, bus);
    system.unlockMemory('sun_memory_1');
    expect(system.unlockMemory('sun_memory_1')).toBe(false);
  });

  it('throws when unlocking an unknown memory id', () => {
    const bus = new TypedEventBus<GameEventMap>();
    const system = new JournalSystem(data, bus);
    expect(() => system.unlockMemory('ghost_memory')).toThrow();
  });
});
