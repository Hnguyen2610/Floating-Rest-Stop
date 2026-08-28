import { describe, expect, it } from 'vitest';
import { WeatherSystem } from './WeatherSystem';
import { TypedEventBus, type GameEventMap } from '../core/EventBus';

describe('WeatherSystem', () => {
  it('adds ingredients to the mixer up to a 2-slot limit', () => {
    const bus = new TypedEventBus<GameEventMap>();
    const system = new WeatherSystem(bus);

    expect(system.addToMixer('morning_dew')).toBe(true);
    expect(system.addToMixer('cool_breeze')).toBe(true);
    expect(system.addToMixer('star_dust')).toBe(false);
    expect(system.getMixerContents()).toEqual(['morning_dew', 'cool_breeze']);
  });

  it('emits mixer:updated with the current contents on every change', () => {
    const bus = new TypedEventBus<GameEventMap>();
    const system = new WeatherSystem(bus);
    const updates: string[][] = [];
    bus.on('mixer:updated', ({ contents }) => updates.push(contents));

    system.addToMixer('morning_dew');
    system.clearMixer();

    expect(updates).toEqual([['morning_dew'], []]);
  });
});
