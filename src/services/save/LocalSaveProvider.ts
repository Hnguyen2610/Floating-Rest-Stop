import type { SaveData, SaveProvider } from './SaveProvider';
import { normalizeSaveData } from './saveMigration';

const STORAGE_KEY = 'floating-rest-stop-save';

export class LocalSaveProvider implements SaveProvider {
  async load(): Promise<SaveData | null> {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return normalizeSaveData(JSON.parse(raw));
    } catch {
      // Corrupted JSON — treat exactly like "no save yet" rather than crashing boot.
      return null;
    }
  }

  async save(data: SaveData): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Storage quota exceeded, private-browsing restrictions, etc. — a failed
      // save must never crash the game; callers already treat saveNow() as
      // best-effort (see SaveSystem.scheduleAutosave), this is the last line
      // of defense for any call site that doesn't.
    }
  }

  async clear(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
  }
}
