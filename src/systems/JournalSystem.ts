import type { TypedEventBus, GameEventMap } from '../core/EventBus';

export interface MemoryDefinition {
  id: string;
  diaryText: string;
}

export interface JournalChapter {
  guestId: string;
  guestName: string;
  memories: MemoryDefinition[];
}

export interface JournalData {
  chapters: JournalChapter[];
}

export class JournalSystem {
  private unlocked = new Set<string>();

  constructor(
    private data: JournalData,
    private eventBus: TypedEventBus<GameEventMap>,
  ) {}

  getChapters(): JournalChapter[] {
    return this.data.chapters;
  }

  isUnlocked(memoryId: string): boolean {
    return this.unlocked.has(memoryId);
  }

  unlockMemory(memoryId: string): boolean {
    if (this.unlocked.has(memoryId)) return false;
    const exists = this.data.chapters.some((chapter) =>
      chapter.memories.some((memory) => memory.id === memoryId),
    );
    if (!exists) throw new Error(`Unknown memory: ${memoryId}`);

    this.unlocked.add(memoryId);
    this.eventBus.emit('memory:unlocked', { memoryId });
    return true;
  }

  getUnlockedIds(): string[] {
    return [...this.unlocked];
  }

  restoreUnlocked(memoryIds: string[]): void {
    this.unlocked = new Set(memoryIds);
  }
}
