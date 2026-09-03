import { describe, expect, it } from 'vitest';
import { DecorationSystem, type DecorationsData } from './DecorationSystem';
import { StationAreaSystem, type AreasData } from './StationAreaSystem';
import { HappinessSystem } from './HappinessSystem';
import { TypedEventBus, type GameEventMap } from '../core/EventBus';

const data: DecorationsData = {
  decorations: [
    { id: 'wind_chime', name: 'Crystal Wind Chime', cost: 1, slotX: 0.1, slotY: 0.3, interactive: true },
    { id: 'tea_table', name: 'Tea Table', cost: 2, slotX: 0.6, slotY: 0.7, interactive: false },
    {
      id: 'wind_pinwheel',
      name: 'Wind Pinwheel',
      cost: 1,
      slotX: 0.1,
      slotY: 0.66,
      interactive: false,
      requiredAreaId: 'wind_garden',
    },
  ],
};

const areasData: AreasData = {
  areas: [{ id: 'wind_garden', name: 'Wind Garden', cost: 10, order: 1 }],
};

function makeSystem(startingCrystals = 0) {
  const bus = new TypedEventBus<GameEventMap>();
  const happiness = new HappinessSystem(bus);
  for (let i = 0; i < startingCrystals; i += 1) happiness.collectCrystal();
  const stationAreaSystem = new StationAreaSystem(areasData, happiness, bus);
  const system = new DecorationSystem(data, happiness, stationAreaSystem, bus);
  return { bus, happiness, stationAreaSystem, system };
}

describe('DecorationSystem', () => {
  it('unlocks a decoration when enough crystals are available, spending the cost', () => {
    const { bus, happiness, system } = makeSystem(1);
    const unlocked: unknown[] = [];
    bus.on('decoration:unlocked', (payload) => unlocked.push(payload));

    expect(system.unlock('wind_chime')).toBe(true);
    expect(system.isUnlocked('wind_chime')).toBe(true);
    expect(happiness.getCount()).toBe(0);
    expect(unlocked).toEqual([{ id: 'wind_chime' }]);
  });

  it('refuses to unlock when there are not enough crystals, and does not spend', () => {
    const { happiness, system } = makeSystem(1);

    expect(system.unlock('tea_table')).toBe(false); // costs 2, only have 1
    expect(system.isUnlocked('tea_table')).toBe(false);
    expect(happiness.getCount()).toBe(1);
  });

  it('refuses to unlock the same decoration twice', () => {
    const { system } = makeSystem(5);

    expect(system.unlock('wind_chime')).toBe(true);
    expect(system.unlock('wind_chime')).toBe(false);
  });

  it('refuses to unlock a decoration whose required station area is not unlocked yet', () => {
    const { system } = makeSystem(5);

    expect(system.isAvailable('wind_pinwheel')).toBe(false);
    expect(system.unlock('wind_pinwheel')).toBe(false);
    expect(system.isUnlocked('wind_pinwheel')).toBe(false);
  });

  it('allows unlocking once the required station area is unlocked', () => {
    const { stationAreaSystem, system } = makeSystem(11); // 10 for area + 1 for decoration
    stationAreaSystem.unlock('wind_garden');

    expect(system.isAvailable('wind_pinwheel')).toBe(true);
    expect(system.unlock('wind_pinwheel')).toBe(true);
  });
});
