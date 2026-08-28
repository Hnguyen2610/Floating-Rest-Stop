export type EmotionId =
  | 'OVERHEATED'
  | 'STRESSED'
  | 'LONELY'
  | 'TIRED'
  | 'INSECURE'
  | 'RELAXED'
  | 'HAPPY';

export type VisitStage = 'ARRIVING' | 'PRESENT' | 'LEAVING';

export type GuestTreatment =
  | { type: 'recipe'; recipeId: string }
  | { type: 'direct'; interactionId: string };

export interface GuestDefinition {
  id: string;
  name: string;
  initialEmotion: EmotionId;
  initialIntensity: number;
  treatment: GuestTreatment;
}

export interface GuestState {
  id: string;
  currentEmotion: EmotionId;
  emotionalIntensity: number;
  visitStage: VisitStage;
  visitCount: number;
  trustLevel: number;
  unlockedMemories: string[];
}
