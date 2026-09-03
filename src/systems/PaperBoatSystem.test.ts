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

describe('PaperBoatSystem', () => {
  it('exposes the configured messages', () => {
    const { system } = makeSystem();
    expect(system.getMessages()).toHaveLength(2);
  });

  it('sends a message, grants a happiness crystal, boosts a guest trust, and emits paperboat:sent', () => {
    const { bus, happinessSystem, guestSystem, system } = makeSystem();
    const received: unknown[] = [];
    bus.on('paperboat:sent', (payload) => received.push(payload));

    const result = system.send('did_well');

    expect(system.getSentCount()).toBe(1);
    expect(happinessSystem.getCount()).toBe(1);
    expect(result.trustGuestId).toBe('sun');
    expect(guestSystem.getProgress('sun').trustLevel).toBe(3);
    expect(received).toEqual([{ messageId: 'did_well', trustGuestId: 'sun' }]);
  });

  it('throws when sending an unknown message id', () => {
    const { system } = makeSystem();
    expect(() => system.send('ghost')).toThrow();
  });

  it('can restore the sent count from a save', () => {
    const { system } = makeSystem();
    system.restoreSentCount(7);
    expect(system.getSentCount()).toBe(7);
  });
});
