import { describe, expect, it, vi } from 'vitest';
import { TypedEventBus, type GameEventMap } from '../core/EventBus';
import { RareWeatherSystem, type RareWeatherData } from './RareWeatherSystem';

const data: RareWeatherData = {
  events: [{
    id: 'meteor_shower',
    name: 'Meteor Shower',
    requiredAreaId: 'stargazing_corner',
    requiredGuestId: 'moon',
    requiredVisitCount: 2,
    visualEffect: 'comet',
    memoryId: 'world_memory_1',
  }],
};

describe('RareWeatherSystem', () => {
  it('starts only when area, night, guest progress, and no active guest are ready', () => {
    const bus = new TypedEventBus<GameEventMap>();
    const started: string[] = [];
    bus.on('rareWeather:started', ({ eventId }) => started.push(eventId));
    const system = new RareWeatherSystem(
      data,
      { isUnlocked: () => true } as never,
      { getProgress: () => ({ visitCount: 2 }) as never, getCurrentGuest: () => null } as never,
      { isNight: () => true } as never,
      { isUnlocked: () => false, unlockMemory: () => true } as never,
      bus,
    );

    expect(system.canStart('meteor_shower')).toBe(true);
    expect(system.start('meteor_shower')).toBe(true);
    expect(started).toEqual(['meteor_shower']);
    expect(system.canStart('meteor_shower')).toBe(false);
  });

  it('restores completed events and does not replay them', () => {
    const bus = new TypedEventBus<GameEventMap>();
    const system = new RareWeatherSystem(
      data,
      { isUnlocked: () => true } as never,
      { getProgress: () => ({ visitCount: 2 }) as never, getCurrentGuest: () => null } as never,
      { isNight: () => true } as never,
      { isUnlocked: () => false, unlockMemory: () => true } as never,
      bus,
    );

    system.restoreState({ completedEventIds: ['meteor_shower'] });
    expect(system.canStart('meteor_shower')).toBe(false);
    expect(system.getSaveState()).toEqual({
      completedEventIds: ['meteor_shower'],
      lastCompletedVisitCounts: { meteor_shower: 2 },
    });
  });

  function makeReady() {
    const bus = new TypedEventBus<GameEventMap>();
    const completed: string[] = [];
    bus.on('rareWeather:completed', ({ eventId }) => completed.push(eventId));
    const journal = { isUnlocked: vi.fn(() => false), unlockMemory: vi.fn(() => true) };
    const system = new RareWeatherSystem(
      data,
      { isUnlocked: () => true } as never,
      { getProgress: () => ({ visitCount: 2 }) as never, getCurrentGuest: () => null } as never,
      { isNight: () => true } as never,
      journal as never,
      bus,
    );
    return { system, journal, completed };
  }

  it('completeActive unlocks the world memory once, emits completed, and marks the event done', () => {
    const { system, journal, completed } = makeReady();
    system.start('meteor_shower');

    system.completeActive();
    system.completeActive();

    expect(journal.unlockMemory).toHaveBeenCalledTimes(1);
    expect(journal.unlockMemory).toHaveBeenCalledWith('world_memory_1');
    expect(completed).toEqual(['meteor_shower']);
    expect(system.isCompleted('meteor_shower')).toBe(true);
    expect(system.getActiveEvent()).toBeNull();
  });

  it('cancelActive frees the system (e.g. scene left mid-event) without completing or unlocking', () => {
    const { system, journal, completed } = makeReady();
    system.start('meteor_shower');
    expect(system.canStart('meteor_shower')).toBe(false);

    system.cancelActive();

    expect(system.getActiveEvent()).toBeNull();
    expect(system.isCompleted('meteor_shower')).toBe(false);
    expect(journal.unlockMemory).not.toHaveBeenCalled();
    expect(completed).toEqual([]);
    expect(system.canStart('meteor_shower')).toBe(true);
  });

  it('allows the event to return after the required guest visits again', () => {
    let moonVisits = 2;
    const bus = new TypedEventBus<GameEventMap>();
    const system = new RareWeatherSystem(
      data,
      { isUnlocked: () => true } as never,
      { getProgress: () => ({ visitCount: moonVisits }) as never, getCurrentGuest: () => null } as never,
      { isNight: () => true } as never,
      { isUnlocked: () => true, unlockMemory: () => false } as never,
      bus,
    );

    system.start('meteor_shower');
    system.completeActive();
    expect(system.canStart('meteor_shower')).toBe(false);
    moonVisits = 3;
    expect(system.canStart('meteor_shower')).toBe(true);
  });
});
