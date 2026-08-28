export interface GuestSaveEntry {
  visitCount: number;
  trustLevel: number;
}

export interface SaveData {
  version: number;
  happinessCrystals: number;
  unlockedDecorations: string[];
  guestProgress: Record<string, GuestSaveEntry>;
  unlockedMemories: string[];
  capturedPhotoMoments: string[];
}

export interface SaveProvider {
  load(): Promise<SaveData | null>;
  save(data: SaveData): Promise<void>;
}
