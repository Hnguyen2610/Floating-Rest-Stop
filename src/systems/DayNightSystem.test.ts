import { describe, expect, it } from 'vitest';
import { DayNightSystem } from './DayNightSystem';
import { TypedEventBus, type GameEventMap } from '../core/EventBus';

function atHour(hour: number): () => Date {
  return () => new Date(2026, 0, 1, hour, 0, 0);
}

describe('DayNightSystem', () => {
  it('is night before DAY_START_HOUR and at/after NIGHT_START_HOUR', () => {
    const bus = new TypedEventBus<GameEventMap>();
    expect(new DayNightSystem(bus, atHour(3)).isNight()).toBe(true);
    expect(new DayNightSystem(bus, atHour(18)).isNight()).toBe(true);
    expect(new DayNightSystem(bus, atHour(23)).isNight()).toBe(true);
  });

  it('is day between DAY_START_HOUR and NIGHT_START_HOUR', () => {
    const bus = new TypedEventBus<GameEventMap>();
    expect(new DayNightSystem(bus, atHour(6)).isNight()).toBe(false);
    expect(new DayNightSystem(bus, atHour(12)).isNight()).toBe(false);
    expect(new DayNightSystem(bus, atHour(17)).isNight()).toBe(false);
  });

  it('refresh() emits daynight:changed only when the result actually flips', () => {
    const bus = new TypedEventBus<GameEventMap>();
    let hour = 12; // day
    const system = new DayNightSystem(bus, () => new Date(2026, 0, 1, hour, 0, 0));
    const received: unknown[] = [];
    bus.on('daynight:changed', (payload) => received.push(payload));

    system.refresh(); // still day, no change
    expect(received).toEqual([]);

    hour = 20; // crosses into night
    system.refresh();
    expect(received).toEqual([{ isNight: true }]);

    system.refresh(); // still night, no duplicate event
    expect(received).toEqual([{ isNight: true }]);
  });

  it('debugCycleOverride() cycles day -> night -> back to real time', () => {
    const bus = new TypedEventBus<GameEventMap>();
    const system = new DayNightSystem(bus, atHour(12)); // real time: day

    system.debugCycleOverride(); // -> night
    expect(system.isNight()).toBe(true);
    system.debugCycleOverride(); // -> day
    expect(system.isNight()).toBe(false);
    system.debugCycleOverride(); // -> back to real time (day, at hour 12)
    expect(system.isNight()).toBe(false);
  });
});
