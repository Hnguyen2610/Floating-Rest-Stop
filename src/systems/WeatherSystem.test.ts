import { describe, expect, it } from 'vitest';
import { WeatherSystem, type RecipesData } from './WeatherSystem';
import { TypedEventBus, type GameEventMap } from '../core/EventBus';

const recipesData: RecipesData = {
  recipes: [
    {
      id: 'cool_drizzle',
      name: 'Cool Drizzle',
      ingredients: ['morning_dew', 'cool_breeze'],
      visualEffect: 'drizzle',
      suitableEmotions: ['OVERHEATED'],
      suitableGuests: ['sun'],
      soothingValue: 30,
    },
  ],
};

function makeSystem() {
  const bus = new TypedEventBus<GameEventMap>();
  return { bus, system: new WeatherSystem(recipesData, bus) };
}

describe('WeatherSystem', () => {
  it('adds ingredients to the mixer up to a 2-slot limit', () => {
    const { system } = makeSystem();
    expect(system.addToMixer('morning_dew')).toBe(true);
    expect(system.addToMixer('cool_breeze')).toBe(true);
    expect(system.addToMixer('star_dust')).toBe(false);
    expect(system.getMixerContents()).toEqual(['morning_dew', 'cool_breeze']);
  });

  it('crafts a potion when the mixer matches a recipe, regardless of ingredient order', () => {
    const { bus, system } = makeSystem();
    const created: unknown[] = [];
    bus.on('weather:created', (payload) => created.push(payload));

    system.addToMixer('cool_breeze');
    system.addToMixer('morning_dew');
    const success = system.tryCraft();

    expect(success).toBe(true);
    expect(system.getCurrentPotion()).toBe('cool_drizzle');
    expect(system.getMixerContents()).toEqual([]);
    expect(created).toEqual([{ recipeId: 'cool_drizzle', isNewDiscovery: true }]);
  });

  it('marks isNewDiscovery true only on the first craft of a given recipe', () => {
    const { bus, system } = makeSystem();
    const created: unknown[] = [];
    bus.on('weather:created', (payload) => created.push(payload));

    expect(system.isRecipeDiscovered('cool_drizzle')).toBe(false);

    system.addToMixer('cool_breeze');
    system.addToMixer('morning_dew');
    system.tryCraft();
    expect(system.isRecipeDiscovered('cool_drizzle')).toBe(true);

    system.usePotion();
    system.addToMixer('morning_dew');
    system.addToMixer('cool_breeze');
    system.tryCraft();

    expect(created).toEqual([
      { recipeId: 'cool_drizzle', isNewDiscovery: true },
      { recipeId: 'cool_drizzle', isNewDiscovery: false },
    ]);
  });

  it('fails to craft when the mixer does not match any recipe', () => {
    const { bus, system } = makeSystem();
    const created: unknown[] = [];
    bus.on('weather:created', (payload) => created.push(payload));

    system.addToMixer('morning_dew');
    system.addToMixer('star_dust');
    const success = system.tryCraft();

    expect(success).toBe(false);
    expect(system.getCurrentPotion()).toBeNull();
    expect(system.getMixerContents()).toEqual(['morning_dew', 'star_dust']);
    expect(created).toEqual([]);
  });

  it('emits mixer:updated with the current contents on every change', () => {
    const { bus, system } = makeSystem();
    const updates: string[][] = [];
    bus.on('mixer:updated', ({ contents }) => updates.push(contents));

    system.addToMixer('morning_dew');
    system.clearMixer();

    expect(updates).toEqual([['morning_dew'], []]);
  });

  it('returns a removed ingredient so the UI can refund it to inventory', () => {
    const { system } = makeSystem();
    system.addToMixer('morning_dew');
    system.addToMixer('cool_breeze');

    expect(system.removeFromMixer(0)).toBe('morning_dew');
    expect(system.getMixerContents()).toEqual(['cool_breeze']);
    expect(system.removeFromMixer(4)).toBeNull();
  });

  it('consumes the current potion on use and emits weather:used', () => {
    const { bus, system } = makeSystem();
    const used: unknown[] = [];
    bus.on('weather:used', (payload) => used.push(payload));

    system.addToMixer('morning_dew');
    system.addToMixer('cool_breeze');
    system.tryCraft();

    const potionId = system.usePotion();

    expect(potionId).toBe('cool_drizzle');
    expect(system.getCurrentPotion()).toBeNull();
    expect(used).toEqual([{ recipeId: 'cool_drizzle' }]);
  });

  it('returns null from usePotion when there is nothing to use', () => {
    const { system } = makeSystem();
    expect(system.usePotion()).toBeNull();
  });
});
