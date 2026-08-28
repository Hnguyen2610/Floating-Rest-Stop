import type { TypedEventBus, GameEventMap } from '../core/EventBus';
import type { EmotionSystem } from './EmotionSystem';
import type { GuestDefinition, GuestState, GuestTreatment } from '../types/guest';

export interface GuestsData {
  guests: GuestDefinition[];
}

export interface GuestProgress {
  visitCount: number;
  trustLevel: number;
}

const TRUST_GAIN_ON_GOOD_VISIT = 8;
const MIN_INITIAL_INTENSITY = 30;

export class GuestSystem {
  private current: GuestState | null = null;
  private progress = new Map<string, GuestProgress>();

  constructor(
    private guestsData: GuestsData,
    private emotionSystem: EmotionSystem,
    private eventBus: TypedEventBus<GameEventMap>,
  ) {}

  getCurrentGuest(): GuestState | null {
    return this.current;
  }

  getProgress(guestId: string): GuestProgress {
    return this.progress.get(guestId) ?? { visitCount: 0, trustLevel: 0 };
  }

  getAllDefinitions(): GuestDefinition[] {
    return this.guestsData.guests;
  }

  restoreProgress(guestId: string, progress: GuestProgress): void {
    this.progress.set(guestId, { ...progress });
  }

  spawn(guestId: string): GuestState {
    const definition = this.guestsData.guests.find((guest) => guest.id === guestId);
    if (!definition) throw new Error(`Unknown guest: ${guestId}`);

    const progress = this.progress.get(guestId) ?? { visitCount: 0, trustLevel: 0 };
    progress.visitCount += 1;
    this.progress.set(guestId, progress);

    // Trust earned on past good visits means less distressed arrivals over
    // time, rather than a hard reset every visit — see brief section 17.
    const startingIntensity = Math.max(
      MIN_INITIAL_INTENSITY,
      definition.initialIntensity - progress.trustLevel,
    );

    const state: GuestState = {
      id: definition.id,
      currentEmotion: definition.initialEmotion,
      emotionalIntensity: startingIntensity,
      visitStage: 'ARRIVING',
      visitCount: progress.visitCount,
      trustLevel: progress.trustLevel,
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

    if (this.isRelaxedOrHappy(this.current.emotionalIntensity)) {
      const progress = this.progress.get(guestId);
      if (progress) progress.trustLevel += TRUST_GAIN_ON_GOOD_VISIT;
    }

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
    const wasRelaxed = this.isRelaxedOrHappy(this.current.emotionalIntensity);

    this.current.emotionalIntensity = this.emotionSystem.soothe(this.current.emotionalIntensity, amount);
    const stage = this.emotionSystem.getStage(this.current.emotionalIntensity);
    if (stage === 'RELAXED' || stage === 'HAPPY') {
      this.current.currentEmotion = stage;
    }
    this.eventBus.emit('guest:emotion-changed', this.current);

    if (!wasRelaxed && this.isRelaxedOrHappy(this.current.emotionalIntensity)) {
      this.eventBus.emit('guest:relaxed', { guestId: this.current.id });
    }
    return this.current;
  }

  private isRelaxedOrHappy(intensity: number): boolean {
    const stage = this.emotionSystem.getStage(intensity);
    return stage === 'RELAXED' || stage === 'HAPPY';
  }
}
