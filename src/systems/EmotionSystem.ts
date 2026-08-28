export type EmotionStage = 'DISTRESSED' | 'CALMING' | 'RELAXED' | 'HAPPY';

export interface EmotionMeta {
  label: string;
  color: string;
}

export interface EmotionsData {
  stageThresholds: { distressed: number; calming: number; relaxed: number };
  emotions: Record<string, EmotionMeta>;
}

export class EmotionSystem {
  constructor(private data: EmotionsData) {}

  getStage(intensity: number): EmotionStage {
    const { distressed, calming, relaxed } = this.data.stageThresholds;
    if (intensity >= distressed) return 'DISTRESSED';
    if (intensity >= calming) return 'CALMING';
    if (intensity >= relaxed) return 'RELAXED';
    return 'HAPPY';
  }

  soothe(intensity: number, amount: number): number {
    return Math.max(0, Math.min(100, intensity - amount));
  }

  getEmotionMeta(emotion: string): EmotionMeta {
    const meta = this.data.emotions[emotion];
    if (!meta) throw new Error(`Unknown emotion: ${emotion}`);
    return meta;
  }
}
