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
});
