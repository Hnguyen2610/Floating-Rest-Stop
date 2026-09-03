import type { TypedEventBus, GameEventMap } from '../core/EventBus';
import type { EmotionSystem } from './EmotionSystem';
import type { GuestDefinition, GuestState, GuestTreatment } from '../types/guest';

export interface GuestsData {
  guests: GuestDefinition[];
}

export interface GuestProgress {
  visitCount: number;
  trustLevel: number;
  successfulTreatments: number;
  memoryProgress: Map<string, number>;
  specialInteractions: number;
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
    return this.progress.get(guestId) ?? {
      visitCount: 0,
      trustLevel: 0,
      successfulTreatments: 0,
      memoryProgress: new Map<string, number>(),
      specialInteractions: 0
    };
  }

  getAllDefinitions(): GuestDefinition[] {
    return this.guestsData.guests;
  }

  restoreProgress(guestId: string, progress: GuestProgress): void {
    this.progress.set(guestId, {
      ...progress,
      memoryProgress: progress.memoryProgress ?? new Map<string, number>()
    });
  }

  spawn(guestId: string): GuestState {
    const definition = this.guestsData.guests.find((guest) => guest.id === guestId);
    if (!definition) throw new Error(`Unknown guest: ${guestId}`);

    const progress = this.progress.get(guestId) ?? {
      visitCount: 0,
      trustLevel: 0,
      successfulTreatments: 0,
      memoryProgress: new Map<string, number>(),
      specialInteractions: 0
    };

    progress.visitCount += 1;
    this.progress.set(guestId, progress);

    // Trust earned on past good visits means less distressed arrivals over
    // time, rather than a hard reset every visit.
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

    if (this.isContentOrBetter(this.current.emotionalIntensity)) {
      const progress = this.progress.get(guestId);
      if (progress) {
        progress.trustLevel += TRUST_GAIN_ON_GOOD_VISIT;
        // Increment successful treatments when guest leaves in good state
        progress.successfulTreatments += 1;
      }
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
    const wasContentOrBetter = this.isContentOrBetter(this.current.emotionalIntensity);

    this.current.emotionalIntensity = this.emotionSystem.soothe(this.current.emotionalIntensity, amount);
    const stage = this.emotionSystem.getStage(this.current.emotionalIntensity);

    // Update current emotion based on stage
    switch (stage) {
      case 'DISTRESSED': this.current.currentEmotion = this.getDistressedEmotion(this.current.id); break;
      case 'CALMING': this.current.currentEmotion = this.getCalmingEmotion(this.current.id); break;
      case 'RELAXED': this.current.currentEmotion = this.getRelaxedEmotion(this.current.id); break;
      case 'CONTENT': this.current.currentEmotion = this.getContentEmotion(this.current.id); break;
      case 'PEACEFUL': this.current.currentEmotion = this.getPeacefulEmotion(this.current.id); break;
    }

    this.eventBus.emit('guest:emotion-changed', this.current);

    if (!wasContentOrBetter && this.isContentOrBetter(this.current.emotionalIntensity)) {
      this.eventBus.emit('guest:relaxed', { guestId: this.current.id });
    }
    return this.current;
  }

  private isContentOrBetter(intensity: number): boolean {
    const stage = this.emotionSystem.getStage(intensity);
    return stage === 'CONTENT' || stage === 'PEACEFUL';
  }

  // Helper methods to get appropriate emotion IDs for each stage
  private getDistressedEmotion(guestId: string): string {
    switch (guestId) {
      case 'sun': return 'SUN_OVERHEATED';
      case 'moon': return 'MOON_LONELY';
      case 'little_star': return 'STAR_INSECURE';
      default: return 'SUN_OVERHEATED';
    }
  }

  private getCalmingEmotion(guestId: string): string {
    switch (guestId) {
      case 'sun': return 'SUN_STRESSED';
      case 'moon': return 'MOON_DISTANT';
      case 'little_star': return 'STAR_HESITANT';
      default: return 'SUN_STRESSED';
    }
  }

  private getRelaxedEmotion(guestId: string): string {
    switch (guestId) {
      case 'sun': return 'SUN_UNEASY';
      case 'moon': return 'MOON_OPENING';
      case 'little_star': return 'STAR_TRYING';
      default: return 'SUN_UNEASY';
    }
  }

  private getContentEmotion(guestId: string): string {
    switch (guestId) {
      case 'sun': return 'SUN_CALMING';
      case 'moon': return 'MOON_SHARING';
      case 'little_star': return 'STAR_BELIEVING';
      default: return 'SUN_CALMING';
    }
  }

  private getPeacefulEmotion(guestId: string): string {
    switch (guestId) {
      case 'sun': return 'SUN_RELAXED';
      case 'moon': return 'MOON_PEACEFUL';
      case 'little_star': return 'STAR_CONFIDENT';
      default: return 'SUN_RELAXED';
    }
  }
}
