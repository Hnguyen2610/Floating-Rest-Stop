import { describe, expect, it } from 'vitest';
import { GuestSystem, type GuestsData } from './GuestSystem';
import { EmotionSystem, type EmotionsData } from './EmotionSystem';
import { TypedEventBus, type GameEventMap } from '../core/EventBus';

const guestsData: GuestsData = {
  guests: [
    {
      id: 'sun',
      name: 'Sun',
      initialEmotion: 'OVERHEATED',
      initialIntensity: 85,
      treatment: { type: 'recipe', recipeId: 'cool_drizzle' },
    },
  ],
};

const emotionsData: EmotionsData = {
  stageThresholds: { distressed: 70, calming: 40, relaxed: 15 },
  emotions: { OVERHEATED: { label: 'Overheated', color: '#f28b82' } },
};

function makeSystem() {
  const bus = new TypedEventBus<GameEventMap>();
  const system = new GuestSystem(guestsData, new EmotionSystem(emotionsData), bus);
  return { bus, system };
}

describe('GuestSystem', () => {
  it('spawns a guest and emits guest:arrived with its initial state', () => {
    const { bus, system } = makeSystem();
    const received: unknown[] = [];
    bus.on('guest:arrived', (state) => received.push(state));

    const state = system.spawn('sun');

    expect(state.currentEmotion).toBe('OVERHEATED');
    expect(state.emotionalIntensity).toBe(85);
    expect(state.visitStage).toBe('ARRIVING');
    expect(received).toHaveLength(1);
    expect(system.getCurrentGuest()).toEqual(state);
  });

  it('throws when spawning an unknown guest id', () => {
    const { system } = makeSystem();
    expect(() => system.spawn('ghost')).toThrow();
  });

  it('clears the current guest and emits guest:left', () => {
    const { bus, system } = makeSystem();
    const received: unknown[] = [];
    bus.on('guest:left', (payload) => received.push(payload));

    system.spawn('sun');
    system.leave();

    expect(system.getCurrentGuest()).toBeNull();
    expect(received).toEqual([{ guestId: 'sun' }]);
  });
});
