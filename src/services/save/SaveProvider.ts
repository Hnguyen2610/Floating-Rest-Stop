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

export interface SaveData {
  version: number;
  happinessCrystals: number;
  unlockedDecorations: string[];
  guestProgress: Record<string, GuestSaveEntry>;
  unlockedMemories: string[];
  capturedPhotoMoments: string[];
  journalLayout: Array<[string, JournalItemSaveEntry]>;
  paperBoatSentCount: number;
  unlockedAreas: string[];
  isNight: boolean;
  cloudyCosmetics: CloudyCosmeticsSaveEntry;
}

export interface SaveProvider {
  load(): Promise<SaveData | null>;
  save(data: SaveData): Promise<void>;
}
