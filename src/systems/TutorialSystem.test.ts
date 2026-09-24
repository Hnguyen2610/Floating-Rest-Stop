import { describe, expect, it } from 'vitest';
import { TutorialSystem } from './TutorialSystem';
import { TypedEventBus, type GameEventMap } from '../core/EventBus';

describe('TutorialSystem', () => {
  it('starts unseen', () => {
    const bus = new TypedEventBus<GameEventMap>();
    const system = new TutorialSystem(bus);
    expect(system.hasSeenWelcome()).toBe(false);
  });

  it('marks the welcome guide seen and emits tutorial:seen once', () => {
    const bus = new TypedEventBus<GameEventMap>();
    const system = new TutorialSystem(bus);
    const received: unknown[] = [];
    bus.on('tutorial:seen', (payload) => received.push(payload));

    system.markWelcomeSeen();
    system.markWelcomeSeen();

    expect(system.hasSeenWelcome()).toBe(true);
    expect(received).toEqual([undefined]);
  });

  it('can restore seen state from a save', () => {
    const bus = new TypedEventBus<GameEventMap>();
    const system = new TutorialSystem(bus);
    system.restoreHasSeenWelcome(true);
    expect(system.hasSeenWelcome()).toBe(true);
  });

  it('advances the first-session tutorial through the real gameplay events', () => {
    const bus = new TypedEventBus<GameEventMap>();
    const system = new TutorialSystem(bus);
    const steps: string[] = [];
    bus.on('tutorial:step-changed', ({ step }) => steps.push(step));

    system.markWelcomeSeen();
    bus.emit('guest:arrived', {} as GameEventMap['guest:arrived']);
    bus.emit('ingredient:collected', { id: 'morning_dew', count: 1 });
    bus.emit('weather:created', { recipeId: 'cool_drizzle', isNewDiscovery: true });
    bus.emit('weather:used', { recipeId: 'cool_drizzle' });
    bus.emit('guest:emotion-changed', {} as GameEventMap['guest:emotion-changed']);
    bus.emit('guest:relaxed', { guestId: 'sun' });

    expect(system.getStep()).toBe('COMPLETE');
    expect(steps).toEqual([
      'WAITING_FOR_GUEST',
      'FIND_INGREDIENT',
      'CRAFT_WEATHER',
      'DELIVER_WEATHER',
      'WATCH_EMOTION',
      'COMPLETE',
    ]);
  });

  it('does not advance when a wrong potion is delivered (no emotion change follows)', () => {
    const bus = new TypedEventBus<GameEventMap>();
    const system = new TutorialSystem(bus);
    system.markWelcomeSeen();
    bus.emit('guest:arrived', {} as GameEventMap['guest:arrived']);
    bus.emit('ingredient:collected', { id: 'morning_dew', count: 1 });
    bus.emit('weather:created', { recipeId: 'gentle_breeze', isNewDiscovery: true });
    bus.emit('weather:used', { recipeId: 'gentle_breeze' });

    expect(system.getStep()).toBe('DELIVER_WEATHER');
  });

  it('treats a seen save with no saved step as already complete (returning players)', () => {
    const bus = new TypedEventBus<GameEventMap>();
    const system = new TutorialSystem(bus);
    system.restoreHasSeenWelcome(true);
    expect(system.getStep()).toBe('COMPLETE');
  });

  it('restores an explicit saved step, and always starts unseen saves at the beginning', () => {
    const bus = new TypedEventBus<GameEventMap>();
    const system = new TutorialSystem(bus);
    system.restoreHasSeenWelcome(true, 'CRAFT_WEATHER');
    expect(system.getStep()).toBe('WAITING_FOR_GUEST');
    system.restoreHasSeenWelcome(true, 'WATCH_EMOTION');
    expect(system.getStep()).toBe('COMPLETE');
    system.restoreHasSeenWelcome(true, 'COMPLETE');
    expect(system.getStep()).toBe('COMPLETE');
    system.restoreHasSeenWelcome(false, 'CRAFT_WEATHER');
    expect(system.getStep()).toBe('WAITING_FOR_GUEST');
  });

  it('sends a rub-treatment guest (no recipe to brew) down the rub track instead of the potion steps', () => {
    const bus = new TypedEventBus<GameEventMap>();
    const system = new TutorialSystem(bus, (guestId) => (guestId === 'little_star' ? 'direct' : 'recipe'));
    const steps: string[] = [];
    bus.on('tutorial:step-changed', ({ step }) => steps.push(step));

    system.markWelcomeSeen();
    bus.emit('guest:arrived', { id: 'little_star' } as GameEventMap['guest:arrived']);
    // ingredient/craft events must not drag a rub guest through the potion steps
    bus.emit('ingredient:collected', { id: 'morning_dew', count: 1 });
    expect(system.getStep()).toBe('RUB_GUEST');

    bus.emit('guest:emotion-changed', {} as GameEventMap['guest:emotion-changed']);
    bus.emit('guest:relaxed', { guestId: 'little_star' });

    expect(system.getStep()).toBe('COMPLETE');
    expect(steps).toEqual(['WAITING_FOR_GUEST', 'RUB_GUEST', 'WATCH_EMOTION', 'COMPLETE']);
  });

  it('keeps recipe guests on the potion track when a resolver is provided', () => {
    const bus = new TypedEventBus<GameEventMap>();
    const system = new TutorialSystem(bus, () => 'recipe');
    system.markWelcomeSeen();
    bus.emit('guest:arrived', { id: 'sun' } as GameEventMap['guest:arrived']);
    expect(system.getStep()).toBe('FIND_INGREDIENT');
  });
});
