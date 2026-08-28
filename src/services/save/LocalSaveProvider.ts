import type { SaveData, SaveProvider } from './SaveProvider';

const STORAGE_KEY = 'floating-rest-stop-save';

export class LocalSaveProvider implements SaveProvider {
  async load(): Promise<SaveData | null> {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as SaveData;
    } catch {
      return null;
    }
  }

  async save(data: SaveData): Promise<void> {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  async clear(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
  }
}
