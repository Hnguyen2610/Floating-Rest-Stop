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
});
