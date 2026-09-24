export type EmotionStage =
  | 'DISTRESSED'
  | 'CALMING'
  | 'RELAXED'
  | 'CONTENT'
  | 'PEACEFUL';

export interface EmotionMeta {
  label: string;
  color: string;
  dialogue?: string[];
}

export interface EmotionsData {
  stageThresholds: {
    distressed: number;
    calming: number;
    relaxed: number;
    content: number;
    peaceful: number
  };
  emotions: Record<string, EmotionMeta>;
}

export class EmotionSystem {
  constructor(private data: EmotionsData) {}

  getStage(intensity: number): EmotionStage {
    const { distressed, calming, relaxed, content, peaceful } = this.data.stageThresholds;
    if (intensity >= distressed) return 'DISTRESSED';
    if (intensity >= calming) return 'CALMING';
    if (intensity >= relaxed) return 'RELAXED';
    if (intensity >= content) return 'CONTENT';
    if (intensity >= peaceful) return 'PEACEFUL';
    return 'PEACEFUL'; // below the lowest threshold is the calmest stage, not the most distressed
  }

  getStageProgress(intensity: number): number {
    const progressByStage: Record<EmotionStage, number> = {
      DISTRESSED: 1,
      CALMING: 2,
      RELAXED: 3,
      CONTENT: 4,
      PEACEFUL: 5,
    };
    return progressByStage[this.getStage(intensity)];
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