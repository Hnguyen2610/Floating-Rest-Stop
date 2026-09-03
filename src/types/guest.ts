// Emotion ids are guest-prefixed and open-ended (e.g. 'SUN_OVERHEATED',
// 'MOON_PEACEFUL') so they aren't enumerable as a fixed union — EmotionSystem
// validates a given id against emotions.json at runtime instead.
export type EmotionId = string;

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
  needHint: string;
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
