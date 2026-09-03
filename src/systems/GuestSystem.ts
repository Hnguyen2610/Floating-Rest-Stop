import type { TypedEventBus, GameEventMap } from '../core/EventBus';
import { type EmotionSystem, type EmotionStage } from './EmotionSystem';
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

// Each guest's flavor of emotion id per shared 5-stage progression. Falls back
// to 'sun' for any guest id not listed here.
const STAGE_EMOTION_BY_GUEST: Record<string, Record<EmotionStage, string>> = {
  sun: {
    DISTRESSED: 'SUN_OVERHEATED',
    CALMING: 'SUN_STRESSED',
    RELAXED: 'SUN_UNEASY',
    CONTENT: 'SUN_CALMING',
    PEACEFUL: 'SUN_RELAXED',
  },
  moon: {
    DISTRESSED: 'MOON_LONELY',
    CALMING: 'MOON_DISTANT',
    RELAXED: 'MOON_OPENING',
    CONTENT: 'MOON_SHARING',
    PEACEFUL: 'MOON_PEACEFUL',
  },
  little_star: {
    DISTRESSED: 'STAR_INSECURE',
    CALMING: 'STAR_HESITANT',
    RELAXED: 'STAR_TRYING',
    CONTENT: 'STAR_BELIEVING',
    PEACEFUL: 'STAR_CONFIDENT',
  },
  butterfly: {
    DISTRESSED: 'BUTTERFLY_WET',
    CALMING: 'BUTTERFLY_RESTING',
    RELAXED: 'BUTTERFLY_DRYING',
    CONTENT: 'BUTTERFLY_CHATTING',
    PEACEFUL: 'BUTTERFLY_HAPPY',
  },
  aurora: {
    DISTRESSED: 'AURORA_DIM',
    CALMING: 'AURORA_FLICKERING',
    RELAXED: 'AURORA_GLOWING',
    CONTENT: 'AURORA_SHIMMERING',
    PEACEFUL: 'AURORA_RADIANT',
  },
  comet: {
    DISTRESSED: 'COMET_FADING',
    CALMING: 'COMET_STIRRING',
    RELAXED: 'COMET_STREAKING',
    CONTENT: 'COMET_BLAZING',
    PEACEFUL: 'COMET_BRILLIANT',
  },
};

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

  // Light-touch trust gain from outside a visit (e.g. sending a kind message
  // via Paper Boat) — smaller than the trust earned from an actual good visit,
  // so it stays a bonus rather than a way to skip soothing guests in person.
  addTrust(guestId: string, amount: number): void {
    const progress = this.progress.get(guestId) ?? {
      visitCount: 0,
      trustLevel: 0,
      successfulTreatments: 0,
      memoryProgress: new Map<string, number>(),
      specialInteractions: 0,
    };
    progress.trustLevel += amount;
    this.progress.set(guestId, progress);
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
    const stageEmotions = STAGE_EMOTION_BY_GUEST[this.current.id] ?? STAGE_EMOTION_BY_GUEST.sun;
    this.current.currentEmotion = stageEmotions[stage];

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
}
