import { describe, expect, it } from 'vitest';
import { DayNightSystem } from './DayNightSystem';
import { TypedEventBus, type GameEventMap } from '../core/EventBus';

describe('DayNightSystem', () => {
  it('starts as day', () => {
    const bus = new TypedEventBus<GameEventMap>();
    const system = new DayNightSystem(bus);
    expect(system.isNight()).toBe(false);
  });

  it('toggles and emits daynight:changed', () => {
    const bus = new TypedEventBus<GameEventMap>();
    const system = new DayNightSystem(bus);
    const received: unknown[] = [];
    bus.on('daynight:changed', (payload) => received.push(payload));

    expect(system.toggle()).toBe(true);
    expect(system.isNight()).toBe(true);
    expect(system.toggle()).toBe(false);
    expect(received).toEqual([{ isNight: true }, { isNight: false }]);
  });

  it('can restore night state from a save', () => {
    const bus = new TypedEventBus<GameEventMap>();
    const system = new DayNightSystem(bus);
    system.restoreIsNight(true);
    expect(system.isNight()).toBe(true);
  });
});
