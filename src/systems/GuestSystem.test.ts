import { describe, expect, it } from 'vitest';
import { GuestSystem, type GuestsData } from './GuestSystem';
import { EmotionSystem, type EmotionsData } from './EmotionSystem';
import { TypedEventBus, type GameEventMap } from '../core/EventBus';

const guestsData: GuestsData = {
  guests: [
    {
      id: 'sun',
      name: 'Sun',
      initialEmotion: 'SUN_OVERHEATED',
      initialIntensity: 85,
      treatment: { type: 'recipe', recipeId: 'cool_drizzle' },
      needHint: 'needs a cool drizzle',
    },
    {
      id: 'moon',
      name: 'Moon',
      initialEmotion: 'MOON_LONELY',
      initialIntensity: 70,
      treatment: { type: 'recipe', recipeId: 'starry_lullaby' },
      needHint: 'needs a starry lullaby',
    },
  ],
};

const emotionsData: EmotionsData = {
  stageThresholds: { distressed: 70, calming: 50, relaxed: 30, content: 10, peaceful: 0 },
  emotions: {
    SUN_OVERHEATED: { label: 'Overheated', color: '#f28b82' },
    SUN_STRESSED: { label: 'Stressed', color: '#f6bd60' },
    SUN_UNEASY: { label: 'Uneasy', color: '#f9d68a' },
    SUN_CALMING: { label: 'Calming', color: '#fde8a8' },
    SUN_RELAXED: { label: 'Relaxed', color: '#ffe08a' },
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

    expect(state.currentEmotion).toBe('SUN_OVERHEATED');
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

  it('flips currentEmotion to the guest-specific id for each stage as intensity drops', () => {
    const { system } = makeSystem();
    system.spawn('sun');

    const relaxed = system.soothe(50); // 85 -> 35, RELAXED band (30-49)
    expect(relaxed?.currentEmotion).toBe('SUN_UNEASY');

    const peaceful = system.soothe(30); // 35 -> 5, PEACEFUL band (<10)
    expect(peaceful?.currentEmotion).toBe('SUN_RELAXED');
  });

  it('emits guest:relaxed only on the transition into CONTENT/PEACEFUL, not on every soothe', () => {
    const { bus, system } = makeSystem();
    const received: unknown[] = [];
    bus.on('guest:relaxed', (payload) => received.push(payload));

    system.spawn('sun');
    system.soothe(10); // 85 -> 75, still DISTRESSED
    system.soothe(20); // 75 -> 55, CALMING
    system.soothe(20); // 55 -> 35, RELAXED (not content-or-better yet)
    system.soothe(10); // 35 -> 25, crosses into CONTENT: should fire once
    system.soothe(20); // 25 -> 5, into PEACEFUL, but already content-or-better before this call

    expect(received).toEqual([{ guestId: 'sun' }]);
  });

  it('returns null from soothe when there is no current guest', () => {
    const { system } = makeSystem();
    expect(system.soothe(10)).toBeNull();
  });

  it('excludes the recently seen guest from the random spawn pool', () => {
    const { system } = makeSystem();
    expect(system.pickRandomSpawnId(['sun'])).toBe('moon');
  });

  it('exposes the current guest preferred treatment', () => {
    const { system } = makeSystem();
    expect(system.getPreferredTreatment()).toBeNull();

    system.spawn('sun');
    expect(system.getPreferredTreatment()).toEqual({ type: 'recipe', recipeId: 'cool_drizzle' });
  });

  it('increments visitCount on every spawn, starting from 1', () => {
    const { system } = makeSystem();
    expect(system.spawn('sun').visitCount).toBe(1);
    system.leave();
    expect(system.spawn('sun').visitCount).toBe(2);
    system.leave();
    expect(system.spawn('sun').visitCount).toBe(3);
  });

  it('gains trust and arrives less distressed after a visit that ends content or better', () => {
    const { system } = makeSystem();

    system.spawn('sun'); // intensity 85
    system.soothe(60); // 85 -> 25, CONTENT
    system.leave(); // ends content-or-better -> gains trust

    const secondVisit = system.spawn('sun');
    expect(secondVisit.trustLevel).toBe(8);
    expect(secondVisit.emotionalIntensity).toBe(85 - 8); // starts less distressed
  });

  it('does not gain trust when a visit ends while still distressed', () => {
    const { system } = makeSystem();

    system.spawn('sun'); // intensity 85, never soothed
    system.leave();

    const secondVisit = system.spawn('sun');
    expect(secondVisit.trustLevel).toBe(0);
    expect(secondVisit.emotionalIntensity).toBe(85);
  });

  it('never lowers starting intensity below the floor regardless of trust', () => {
    const { system } = makeSystem();

    for (let i = 0; i < 10; i += 1) {
      system.spawn('sun');
      system.soothe(90); // always ends content/peaceful
      system.leave();
    }

    const state = system.spawn('sun');
    expect(state.emotionalIntensity).toBeGreaterThanOrEqual(30);
  });
});
