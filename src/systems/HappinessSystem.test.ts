import { describe, expect, it } from 'vitest';
import { HappinessSystem } from './HappinessSystem';
import { TypedEventBus, type GameEventMap } from '../core/EventBus';

describe('HappinessSystem', () => {
  it('increments the crystal count and emits happiness:collected', () => {
    const bus = new TypedEventBus<GameEventMap>();
    const system = new HappinessSystem(bus);
    const received: unknown[] = [];
    bus.on('happiness:collected', (payload) => received.push(payload));

    expect(system.collectCrystal()).toBe(1);
    expect(system.collectCrystal()).toBe(2);
    expect(system.getCount()).toBe(2);
    expect(received).toEqual([{ count: 1 }, { count: 2 }]);
  });

  it('spends crystals when there are enough, and emits happiness:spent', () => {
    const bus = new TypedEventBus<GameEventMap>();
    const system = new HappinessSystem(bus);
    const received: unknown[] = [];
    bus.on('happiness:spent', (payload) => received.push(payload));

    system.collectCrystal();
    system.collectCrystal();

    expect(system.spendCrystals(2)).toBe(true);
    expect(system.getCount()).toBe(0);
    expect(received).toEqual([{ count: 0 }]);
  });

  it('refuses to spend more crystals than are available', () => {
    const bus = new TypedEventBus<GameEventMap>();
    const system = new HappinessSystem(bus);

    expect(system.spendCrystals(1)).toBe(false);
    expect(system.getCount()).toBe(0);
  });
});
