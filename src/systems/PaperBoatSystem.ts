import type { TypedEventBus, GameEventMap } from '../core/EventBus';
import type { HappinessSystem } from './HappinessSystem';
import type { GuestSystem } from './GuestSystem';

const TRUST_REWARD = 3;

export interface PaperMessageDefinition {
  id: string;
  text: string;
}

export interface PaperMessagesData {
  messages: PaperMessageDefinition[];
}

export interface PaperBoatSendResult {
  messageId: string;
  trustGuestId: string | null;
}

export class PaperBoatSystem {
  private sentCount = 0;

  constructor(
    private data: PaperMessagesData,
    private happinessSystem: HappinessSystem,
    private guestSystem: GuestSystem,
    private eventBus: TypedEventBus<GameEventMap>,
  ) {}

  getMessages(): PaperMessageDefinition[] {
    return this.data.messages;
  }

  // Reward is deliberately mixed rather than a single fixed payout: a crystal
  // every time, plus a small trust bump for one guest picked at random — a
  // light "your kindness reaches someone" touch, not a farming shortcut (it's
  // well under the +8 trust a guest gains from an actual good visit).
  send(messageId: string): PaperBoatSendResult {
    const exists = this.data.messages.some((message) => message.id === messageId);
    if (!exists) throw new Error(`Unknown message: ${messageId}`);

    this.sentCount += 1;
    this.happinessSystem.collectCrystal();

    const definitions = this.guestSystem.getAllDefinitions();
    let trustGuestId: string | null = null;
    if (definitions.length > 0) {
      trustGuestId = definitions[Math.floor(Math.random() * definitions.length)].id;
      this.guestSystem.addTrust(trustGuestId, TRUST_REWARD);
    }

    this.eventBus.emit('paperboat:sent', { messageId, trustGuestId });
    return { messageId, trustGuestId };
  }

  getSentCount(): number {
    return this.sentCount;
  }

  restoreSentCount(count: number): void {
    this.sentCount = count;
  }
}
