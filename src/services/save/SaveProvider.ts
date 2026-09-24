export interface GuestSaveEntry {
  visitCount: number;
  trustLevel: number;
  successfulTreatments: number;
  memoryProgress: Array<[string, number]>;
  specialInteractions: number;
}

export interface JournalItemSaveEntry {
  stickerType: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

export interface CloudyCosmeticsSaveEntry {
  unlockedShapes: string[];
  unlockedAccessories: string[];
  equippedShape: string;
  equippedAccessories: string[];
}

export interface PaperBoatSaveEntry {
  sentCount: number;
  incomingMessageId: string | null;
  canSend: boolean;
}

export interface AudioSettingsSave {
  muted: boolean;
  masterVolume: number;
  busVolumes: Record<string, number>;
}

export interface RareWeatherSaveState {
  completedEventIds: string[];
  lastCompletedVisitCounts?: Record<string, number>;
}

export type TutorialStepSave =
  | 'WAITING_FOR_GUEST'
  | 'FIND_INGREDIENT'
  | 'CRAFT_WEATHER'
  | 'DELIVER_WEATHER'
  | 'RUB_GUEST'
  | 'WATCH_EMOTION'
  | 'COMPLETE';

export interface SaveData {
  version: number;
  happinessCrystals: number;
  unlockedDecorations: string[];
  guestProgress: Record<string, GuestSaveEntry>;
  unlockedMemories: string[];
  capturedPhotoMoments: string[];
  journalLayout: Array<[string, JournalItemSaveEntry]>;
  paperBoat: PaperBoatSaveEntry;
  unlockedAreas: string[];
  cloudyCosmetics: CloudyCosmeticsSaveEntry;
  hasSeenTutorial: boolean;
  tutorialStep?: TutorialStepSave;
  audioSettings?: Partial<AudioSettingsSave>;
  rareWeather?: RareWeatherSaveState;
  guestEmotionStages?: Record<string, string[]>;
  discoveredRecipeIds?: string[];
}

export interface SaveProvider {
  load(): Promise<SaveData | null>;
  save(data: SaveData): Promise<void>;
}
