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

export interface PaperBoatSaveState {
  sentCount: number;
  incomingMessageId: string | null;
  canSend: boolean;
}

/**
 * Pass 27 rework: Paper Boat used to be a bare "send" button you could spam
 * indefinitely (open, fold x3, release, repeat — a few clicks for a free
 * crystal + trust every time). That's an economy exploit, but a cooldown
 * timer would only fix the number while leaving the design broken — the
 * brief is literally "Receive kindness ↓ Pass kindness onward," and the old
 * flow never had a receive step at all.
 *
 * Now: a kind message has to arrive (`incomingMessage`) and be read
 * (`acknowledgeIncoming`) before the player is allowed to fold and send one
 * of their own (`canSend`). A new incoming message only appears after the
 * player actually relaxes a guest — the real soothing loop, not a clock —
 * so pacing comes from playing the game, not from waiting it out.
 */
export class PaperBoatSystem {
  private sentCount = 0;
  private incomingMessage: PaperMessageDefinition | null = null;
  private canSend = false;

  constructor(
    private data: PaperMessagesData,
    private happinessSystem: HappinessSystem,
    private guestSystem: GuestSystem,
    private eventBus: TypedEventBus<GameEventMap>,
  ) {
    this.eventBus.on('guest:relaxed', () => this.checkForIncoming());
  }

  getMessages(): PaperMessageDefinition[] {
    return this.data.messages;
  }

  getIncoming(): PaperMessageDefinition | null {
    return this.incomingMessage;
  }

  canSendNow(): boolean {
    return this.canSend;
  }

  // Reading the incoming message is what unlocks the ability to send —
  // there's no send-only path.
  acknowledgeIncoming(): void {
    if (!this.incomingMessage) return;
    this.incomingMessage = null;
    this.canSend = true;
  }

  // Reward is deliberately mixed rather than a single fixed payout: a crystal
  // every time, plus a small trust bump for one guest picked at random — a
  // light "your kindness reaches someone" touch, not a farming shortcut (it's
  // well under the +8 trust a guest gains from an actual good visit). This
  // is no longer reachable without first receiving and reading a message.
  send(messageId: string): PaperBoatSendResult {
    if (!this.canSend) throw new Error('Nothing to pass on yet — read an incoming message first');
    const exists = this.data.messages.some((message) => message.id === messageId);
    if (!exists) throw new Error(`Unknown message: ${messageId}`);

    this.canSend = false;
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

  private checkForIncoming(): void {
    if (this.incomingMessage || this.canSend) return; // something's already pending
    if (this.data.messages.length === 0) return;
    this.incomingMessage = this.data.messages[Math.floor(Math.random() * this.data.messages.length)];
  }

  getSaveState(): PaperBoatSaveState {
    return {
      sentCount: this.sentCount,
      incomingMessageId: this.incomingMessage?.id ?? null,
      canSend: this.canSend,
    };
  }

  restoreState(state: PaperBoatSaveState): void {
    this.sentCount = state.sentCount;
    this.canSend = state.canSend;
    this.incomingMessage = state.incomingMessageId
      ? (this.data.messages.find((message) => message.id === state.incomingMessageId) ?? null)
      : null;
  }
}
