import type { TypedEventBus, GameEventMap } from '../core/EventBus';
import type { EmotionSystem } from './EmotionSystem';
import type { GuestDefinition, GuestState, GuestTreatment } from '../types/guest';

export interface GuestsData {
  guests: GuestDefinition[];
}

export class GuestSystem {
  private current: GuestState | null = null;

  constructor(
    private guestsData: GuestsData,
    private emotionSystem: EmotionSystem,
    private eventBus: TypedEventBus<GameEventMap>,
  ) {}

  getCurrentGuest(): GuestState | null {
    return this.current;
  }

  spawn(guestId: string): GuestState {
    const definition = this.guestsData.guests.find((guest) => guest.id === guestId);
    if (!definition) throw new Error(`Unknown guest: ${guestId}`);

    const state: GuestState = {
      id: definition.id,
      currentEmotion: definition.initialEmotion,
      emotionalIntensity: definition.initialIntensity,
      visitStage: 'ARRIVING',
      visitCount: 1,
      trustLevel: 0,
      unlockedMemories: [],
    };
    // Confirms the emotion id resolves in emotions.json before anything renders it.
    this.emotionSystem.getEmotionMeta(state.currentEmotion);

    this.current = state;
    this.eventBus.emit('guest:arrived', state);
    return state;
  }

  leave(): void {
    if (!this.current) return;
    const guestId = this.current.id;
    this.current = null;
    this.eventBus.emit('guest:left', { guestId });
  }

  getPreferredTreatment(): GuestTreatment | null {
    if (!this.current) return null;
    const definition = this.guestsData.guests.find((guest) => guest.id === this.current!.id);
    return definition?.treatment ?? null;
  }

  soothe(amount: number): GuestState | null {
    if (!this.current) return null;
    this.current.emotionalIntensity = this.emotionSystem.soothe(this.current.emotionalIntensity, amount);
    const stage = this.emotionSystem.getStage(this.current.emotionalIntensity);
    if (stage === 'RELAXED' || stage === 'HAPPY') {
      this.current.currentEmotion = stage;
    }
    this.eventBus.emit('guest:emotion-changed', this.current);
    return this.current;
  }
}
