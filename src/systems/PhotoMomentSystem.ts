import type { TypedEventBus, GameEventMap } from '../core/EventBus';
import type { JournalSystem } from './JournalSystem';

export interface PhotoMomentDefinition {
  id: string;
  guestId: string;
  memoryId: string;
}

export interface PhotoMomentsData {
  photoMoments: PhotoMomentDefinition[];
}

export interface PhotoMemory {
  photoMomentId: string;
  guestId: string;
  unlockedAt: number;
}

export class PhotoMomentSystem {
  private captured = new Map<string, PhotoMemory>();

  constructor(
    private data: PhotoMomentsData,
    private journalSystem: JournalSystem,
    private eventBus: TypedEventBus<GameEventMap>,
  ) {}

  getMomentForGuest(guestId: string): PhotoMomentDefinition | null {
    return this.data.photoMoments.find((moment) => moment.guestId === guestId) ?? null;
  }

  isCaptured(photoMomentId: string): boolean {
    return this.captured.has(photoMomentId);
  }

  capture(guestId: string): PhotoMemory | null {
    const moment = this.getMomentForGuest(guestId);
    if (!moment || this.captured.has(moment.id)) return null;
    // Don't spend this one-shot photo moment on a memory whose chapter isn't
    // accessible yet — StationScene already gates the icon from appearing at
    // all in that case, this is the belt-and-suspenders backstop.
    if (!this.journalSystem.canUnlockMemory(moment.memoryId)) return null;

    const memory: PhotoMemory = { photoMomentId: moment.id, guestId, unlockedAt: Date.now() };
    this.captured.set(moment.id, memory);
    this.journalSystem.unlockMemory(moment.memoryId);
    this.eventBus.emit('photo:captured', { photoMomentId: moment.id, guestId });
    return memory;
  }

  getCapturedIds(): string[] {
    return [...this.captured.keys()];
  }

  restoreCaptured(photoMomentIds: string[]): void {
    this.captured = new Map(
      photoMomentIds.map((id) => {
        const moment = this.data.photoMoments.find((m) => m.id === id);
        const memory: PhotoMemory = {
          photoMomentId: id,
          guestId: moment?.guestId ?? '',
          unlockedAt: Date.now(),
        };
        return [id, memory];
      }),
    );
  }
}
