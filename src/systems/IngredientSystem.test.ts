import { describe, expect, it } from 'vitest';
import { IngredientSystem, type IngredientsData } from './IngredientSystem';
import { TypedEventBus, type GameEventMap } from '../core/EventBus';

const data: IngredientsData = {
  ingredients: [
    { id: 'morning_dew', name: 'Morning Dew', color: '#bfe3d0' },
    { id: 'cool_breeze', name: 'Cool Breeze', color: '#a9d8f0' },
  ],
};

describe('IngredientSystem', () => {
  it('collects ingredients into the inventory and emits ingredient:collected', () => {
    const bus = new TypedEventBus<GameEventMap>();
    const system = new IngredientSystem(data, bus);
    const received: unknown[] = [];
    bus.on('ingredient:collected', (payload) => received.push(payload));

    system.collect('morning_dew');
    system.collect('morning_dew');

    expect(system.getCount('morning_dew')).toBe(2);
    expect(received).toEqual([
      { id: 'morning_dew', count: 1 },
      { id: 'morning_dew', count: 2 },
    ]);
  });

  it('throws when collecting an unknown ingredient id', () => {
    const bus = new TypedEventBus<GameEventMap>();
    const system = new IngredientSystem(data, bus);
    expect(() => system.collect('ghost')).toThrow();
  });

  it('spends a collected ingredient, decrementing the count and emitting ingredient:spent', () => {
    const bus = new TypedEventBus<GameEventMap>();
    const system = new IngredientSystem(data, bus);
    const received: unknown[] = [];
    bus.on('ingredient:spent', (payload) => received.push(payload));

    system.collect('morning_dew');
    system.collect('morning_dew');

    expect(system.spend('morning_dew')).toBe(true);
    expect(system.getCount('morning_dew')).toBe(1);
    expect(received).toEqual([{ id: 'morning_dew', count: 1 }]);
  });

  it('refuses to spend an ingredient with zero in inventory', () => {
    const bus = new TypedEventBus<GameEventMap>();
    const system = new IngredientSystem(data, bus);
    expect(system.spend('cool_breeze')).toBe(false);
  });
});
