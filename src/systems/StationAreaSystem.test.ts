import { describe, expect, it } from 'vitest';
import { StationAreaSystem, type AreasData } from './StationAreaSystem';
import { HappinessSystem } from './HappinessSystem';
import { TypedEventBus, type GameEventMap } from '../core/EventBus';

const data: AreasData = {
  areas: [
    { id: 'small_cloud', name: 'Small Cloud', cost: 0, order: 1 },
    { id: 'tea_corner', name: 'Tea Corner', cost: 5, order: 2 },
    { id: 'wind_garden', name: 'Wind Garden', cost: 10, order: 3 },
  ],
};

function makeSystem() {
  const bus = new TypedEventBus<GameEventMap>();
  const happinessSystem = new HappinessSystem(bus);
  const system = new StationAreaSystem(data, happinessSystem, bus);
  return { bus, happinessSystem, system };
}

describe('StationAreaSystem', () => {
  it('starts with free (cost 0) areas already unlocked', () => {
    const { system } = makeSystem();
    expect(system.isUnlocked('small_cloud')).toBe(true);
    expect(system.isUnlocked('tea_corner')).toBe(false);
  });

  it('returns definitions sorted by order', () => {
    const { system } = makeSystem();
    expect(system.getAllDefinitions().map((a) => a.id)).toEqual(['small_cloud', 'tea_corner', 'wind_garden']);
  });

  it('unlocks an area by spending crystals and emits area:unlocked', () => {
    const { bus, happinessSystem, system } = makeSystem();
    for (let i = 0; i < 5; i += 1) happinessSystem.collectCrystal();
    const received: unknown[] = [];
    bus.on('area:unlocked', (payload) => received.push(payload));

    expect(system.unlock('tea_corner')).toBe(true);
    expect(system.isUnlocked('tea_corner')).toBe(true);
    expect(happinessSystem.getCount()).toBe(0);
    expect(received).toEqual([{ id: 'tea_corner' }]);
  });

  it('refuses to unlock without enough crystals', () => {
    const { system } = makeSystem();
    expect(system.unlock('wind_garden')).toBe(false);
    expect(system.isUnlocked('wind_garden')).toBe(false);
  });

  it('restores unlocked areas while keeping the free defaults', () => {
    const { system } = makeSystem();
    system.restoreUnlocked(['wind_garden']);
    expect(system.isUnlocked('small_cloud')).toBe(true);
    expect(system.isUnlocked('wind_garden')).toBe(true);
  });
});
