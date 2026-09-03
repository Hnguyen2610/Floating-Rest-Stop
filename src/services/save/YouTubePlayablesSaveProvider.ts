import type { SaveData, SaveProvider } from './SaveProvider';
import { normalizeSaveData } from './saveMigration';

/**
 * Mirrors LocalSaveProvider but persists through the YouTube Playables SDK's
 * cloud save (`ytgame.game.loadData()`/`saveData()`) instead of
 * `localStorage`. Reuses `normalizeSaveData()` so a corrupted or
 * older-schema cloud save is defended against exactly the same way a
 * corrupted local save is — the two providers share every normalization
 * rule and only differ in where the bytes live.
 */
export class YouTubePlayablesSaveProvider implements SaveProvider {
  async load(): Promise<SaveData | null> {
    if (!window.ytgame) return null;
    try {
      const raw = await window.ytgame.game.loadData();
      if (!raw) return null;
      return normalizeSaveData(JSON.parse(raw));
    } catch {
      // Corrupted JSON or SDK error — treat like "no save yet" rather than crashing boot.
      return null;
    }
  }

  async save(data: SaveData): Promise<void> {
    if (!window.ytgame) return;
    try {
      await window.ytgame.game.saveData(JSON.stringify(data));
    } catch {
      // Best-effort, same contract as LocalSaveProvider.save().
    }
  }

  async clear(): Promise<void> {
    if (!window.ytgame) return;
    try {
      await window.ytgame.game.saveData(JSON.stringify(null));
    } catch {
      // Best-effort.
    }
  }
}
