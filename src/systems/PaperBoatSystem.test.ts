import { describe, expect, it } from 'vitest';
import { PaperBoatSystem, type PaperMessagesData } from './PaperBoatSystem';
import { HappinessSystem } from './HappinessSystem';
import { GuestSystem, type GuestsData } from './GuestSystem';
import { EmotionSystem, type EmotionsData } from './EmotionSystem';
import { TypedEventBus, type GameEventMap } from '../core/EventBus';

const data: PaperMessagesData = {
  messages: [
    { id: 'did_well', text: 'Hôm nay bạn đã làm rất tốt.' },
    { id: 'no_rush', text: 'Bạn không cần phải vội.' },
  ],
};

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
  ],
};

const emotionsData: EmotionsData = {
  stageThresholds: { distressed: 70, calming: 50, relaxed: 30, content: 10, peaceful: 0 },
  emotions: { SUN_OVERHEATED: { label: 'Overheated', color: '#f28b82' } },
};

function makeSystem() {
  const bus = new TypedEventBus<GameEventMap>();
  const happinessSystem = new HappinessSystem(bus);
  const guestSystem = new GuestSystem(guestsData, new EmotionSystem(emotionsData), bus);
  const system = new PaperBoatSystem(data, happinessSystem, guestSystem, bus);
  return { bus, happinessSystem, guestSystem, system };
}

function relax(bus: TypedEventBus<GameEventMap>): void {
  bus.emit('guest:relaxed', { guestId: 'sun' });
}

describe('PaperBoatSystem', () => {
  it('exposes the configured messages', () => {
    const { system } = makeSystem();
    expect(system.getMessages()).toHaveLength(2);
  });

  it('starts with nothing incoming and cannot send yet', () => {
    const { system } = makeSystem();
    expect(system.getIncoming()).toBeNull();
    expect(system.canSendNow()).toBe(false);
    expect(() => system.send('did_well')).toThrow();
  });

  it('receives an incoming message once a guest relaxes', () => {
    const { bus, system } = makeSystem();
    relax(bus);
    expect(system.getIncoming()).not.toBeNull();
    expect(system.canSendNow()).toBe(false);
  });

  it('unlocks sending only after the incoming message is acknowledged', () => {
    const { bus, system } = makeSystem();
    relax(bus);

    expect(() => system.send('did_well')).toThrow();

    system.acknowledgeIncoming();
    expect(system.getIncoming()).toBeNull();
    expect(system.canSendNow()).toBe(true);
  });

  it('sends a message, grants a happiness crystal, boosts a guest trust, and emits paperboat:sent', () => {
    const { bus, happinessSystem, guestSystem, system } = makeSystem();
    relax(bus);
    system.acknowledgeIncoming();

    const received: unknown[] = [];
    bus.on('paperboat:sent', (payload) => received.push(payload));

    const result = system.send('did_well');

    expect(system.getSentCount()).toBe(1);
    expect(happinessSystem.getCount()).toBe(1);
    expect(result.trustGuestId).toBe('sun');
    expect(guestSystem.getProgress('sun').trustLevel).toBe(3);
    expect(received).toEqual([{ messageId: 'did_well', trustGuestId: 'sun' }]);
  });

  it('cannot send again immediately after sending — a new message must arrive first', () => {
    const { bus, system } = makeSystem();
    relax(bus);
    system.acknowledgeIncoming();
    system.send('did_well');

    expect(system.canSendNow()).toBe(false);
    expect(system.getIncoming()).toBeNull();
    expect(() => system.send('no_rush')).toThrow();

    relax(bus);
    expect(system.getIncoming()).not.toBeNull();
  });

  it('throws when sending an unknown message id even if ready to send', () => {
    const { bus, system } = makeSystem();
    relax(bus);
    system.acknowledgeIncoming();
    expect(() => system.send('ghost')).toThrow();
  });

  it('can save and restore full state, including a pending incoming message', () => {
    const { bus, system } = makeSystem();
    relax(bus);
    const incomingId = system.getIncoming()?.id;

    const state = system.getSaveState();
    expect(state).toEqual({ sentCount: 0, incomingMessageId: incomingId, canSend: false });

    const { system: restored } = makeSystem();
    restored.restoreState(state);
    expect(restored.getIncoming()?.id).toBe(incomingId);
    expect(restored.canSendNow()).toBe(false);
  });

  it('restores a ready-to-send state without needing a new incoming message', () => {
    const { system } = makeSystem();
    system.restoreState({ sentCount: 4, incomingMessageId: null, canSend: true });

    expect(system.getSentCount()).toBe(4);
    expect(system.canSendNow()).toBe(true);
    expect(() => system.send('did_well')).not.toThrow();
  });
});
