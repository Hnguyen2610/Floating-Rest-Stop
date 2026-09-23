import type { TypedEventBus, GameEventMap } from '../core/EventBus';

// Tracks whether the player has dismissed the first-launch welcome guide —
// persisted through the same SaveProvider as everything else (not raw
// localStorage) so it works correctly on YouTube Playables too, which has
// its own storage mechanism behind that same abstraction.
export class TutorialSystem {
  private seen = false;

  constructor(private eventBus: TypedEventBus<GameEventMap>) {}

  hasSeenWelcome(): boolean {
    return this.seen;
  }

  markWelcomeSeen(): void {
    if (this.seen) return;
    this.seen = true;
    this.eventBus.emit('tutorial:seen', undefined);
  }

  restoreHasSeenWelcome(seen: boolean): void {
    this.seen = seen;
  }
}
