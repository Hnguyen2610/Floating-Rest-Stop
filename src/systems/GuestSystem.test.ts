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
  emotions: {
    OVERHEATED: { label: 'Overheated', color: '#f28b82' },
    RELAXED: { label: 'Relaxed', color: '#bfe3d0' },
    HAPPY: { label: 'Happy', color: '#ffe08a' },
  },
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

  it('reduces intensity and emits guest:emotion-changed on soothe', () => {
    const { bus, system } = makeSystem();
    const received: unknown[] = [];
    bus.on('guest:emotion-changed', (state) => received.push(state));

    system.spawn('sun');
    const updated = system.soothe(10);

    expect(updated?.emotionalIntensity).toBe(75);
    expect(received).toHaveLength(1);
  });

  it('flips currentEmotion to RELAXED/HAPPY once intensity crosses into those stages', () => {
    const { system } = makeSystem();
    system.spawn('sun');

    const relaxed = system.soothe(50); // 85 -> 35, RELAXED band (15-39)
    expect(relaxed?.currentEmotion).toBe('RELAXED');

    const happy = system.soothe(30); // 35 -> 5, HAPPY band (<15)
    expect(happy?.currentEmotion).toBe('HAPPY');
  });

  it('returns null from soothe when there is no current guest', () => {
    const { system } = makeSystem();
    expect(system.soothe(10)).toBeNull();
  });

  it('exposes the current guest preferred treatment', () => {
    const { system } = makeSystem();
    expect(system.getPreferredTreatment()).toBeNull();

    system.spawn('sun');
    expect(system.getPreferredTreatment()).toEqual({ type: 'recipe', recipeId: 'cool_drizzle' });
  });
});
