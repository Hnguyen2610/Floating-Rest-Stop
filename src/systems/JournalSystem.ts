import type { TypedEventBus, GameEventMap } from '../core/EventBus';
import type { GuestSystem } from './GuestSystem';
import type { GuestState } from '../types/guest';

export interface MemoryDefinition {
  id: string;
  diaryText: string;
  hint: string; // Hint for locked memory
  photoMomentId?: string; // Optional link to photo moment
  unlockedAtStage?: string; // Which emotional stage unlocks this memory
}

export interface JournalChapter {
  id: string;
  guestId: string;
  guestName: string;
  title: string; // Chapter title like "01 First Visit"
  memories: MemoryDefinition[];
  // Progression requirements for this chapter
  requiredVisitCount?: number;
  requiredTrustLevel?: number;
  requiredSuccessfulTreatments?: number;
}

export interface JournalData {
  chapters: JournalChapter[];
}

export class JournalSystem {
  private unlocked = new Set<string>();
  private journalLayout: Map<string, { x: number; y: number; rotation: number; scale: number }> = new Map();

  constructor(
    private data: JournalData,
    private eventBus: TypedEventBus<GameEventMap>,
    private guestSystem: GuestSystem,
  ) {
    this.eventBus.on('guest:emotion-changed', (state) => this.checkStageUnlocks(state));
  }

  // Auto-unlocks a memory the moment its guest reaches the emotional stage it's
  // tied to, but only within a chapter that's already accessible, and never for
  // memories that are meant to be unlocked by capturing a photo moment instead.
  private checkStageUnlocks(state: GuestState): void {
    const guestChapters = this.data.chapters.filter((chapter) => chapter.guestId === state.id);
    for (const chapter of guestChapters) {
      if (!this.isChapterAccessible(chapter)) continue;
      for (const memory of chapter.memories) {
        if (memory.photoMomentId) continue;
        if (memory.unlockedAtStage !== state.currentEmotion) continue;
        if (this.isUnlocked(memory.id)) continue;
        this.unlockMemory(memory.id);
      }
    }
  }

  getChapters(): JournalChapter[] {
    return this.data.chapters;
  }

  getChapterById(chapterId: string): JournalChapter | undefined {
    return this.data.chapters.find(chapter => chapter.id === chapterId);
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

  // Journal decoration layout management
  setJournalItemLayout(itemId: string, x: number, y: number, rotation: number = 0, scale: number = 1): void {
    this.journalLayout.set(itemId, { x, y, rotation, scale });
    this.eventBus.emit('journal:layout-updated', { itemId, x, y, rotation, scale });
  }

  getJournalItemLayout(itemId: string): { x: number; y: number; rotation: number; scale: number } | undefined {
    return this.journalLayout.get(itemId);
  }

  getAllJournalLayouts(): Map<string, { x: number; y: number; rotation: number; scale: number }> {
    return new Map(this.journalLayout);
  }

  // Check if a chapter is accessible based on player progress
  isChapterAccessible(chapter: JournalChapter): boolean {
    const guestId = chapter.guestId;
    const progress = this.guestSystem.getProgress(guestId);

    // Check visit count requirement
    if (chapter.requiredVisitCount !== undefined && progress.visitCount < chapter.requiredVisitCount) {
      return false;
    }

    // Check trust level requirement
    if (chapter.requiredTrustLevel !== undefined && progress.trustLevel < chapter.requiredTrustLevel) {
      return false;
    }

    // Check successful treatments requirement
    if (chapter.requiredSuccessfulTreatments !== undefined && progress.successfulTreatments < chapter.requiredSuccessfulTreatments) {
      return false;
    }

    return true;
  }

  // Get unlocked memories for a guest with their unlock stages
  getGuestUnlockedMemoriesWithDetails(guestId: string): Array<{
    memoryId: string;
    diaryText: string;
    hint: string;
    unlockedAtStage?: string;
    photoMomentId?: string;
  }> {
    const results: Array<{
      memoryId: string;
      diaryText: string;
      hint: string;
      unlockedAtStage?: string;
      photoMomentId?: string;
    }> = [];

    const guestChapters = this.data.chapters.filter(chapter => chapter.guestId === guestId);

    for (const chapter of guestChapters) {
      for (const memory of chapter.memories) {
        if (this.isUnlocked(memory.id)) {
          results.push({
            memoryId: memory.id,
            diaryText: memory.diaryText,
            hint: memory.hint,
            unlockedAtStage: memory.unlockedAtStage,
            photoMomentId: memory.photoMomentId
          });
        }
      }
    }

    return results;
  }

  // Check if a photo moment has been captured
  isPhotoMomentCaptured(photoMomentId: string): boolean {
    // This would typically check against a photo moment system
    // For now, we'll check if any memory linked to this photo moment is unlocked
    const memory = this.data.chapters.flatMap(chapter => chapter.memories)
      .find(memory => memory.photoMomentId === photoMomentId);

    return memory ? this.isUnlocked(memory.id) : false;
  }
}