import type { TypedEventBus, GameEventMap } from '../core/EventBus';
import { DAY_START_HOUR, NIGHT_START_HOUR } from '../core/GameConfig';

// Tracks real-world day/night rather than a manual player toggle — a
// deliberate "living world" touch (same idea as Animal Crossing) requested
// explicitly, replacing the earlier Pass 21 design ("no time pressure"
// manual ☀️/🌙 button). Aurora's `isNight()` gate in RareGuestSystem is kept
// exactly as-is on purpose (confirmed with the user): meeting Aurora is
// meant to require actually coming back at night, not just tapping a toggle.
export class DayNightSystem {
  private debugOverride: boolean | null = null;
  private lastKnown: boolean;

  constructor(
    private eventBus: TypedEventBus<GameEventMap>,
    private now: () => Date = () => new Date(),
  ) {
    this.lastKnown = this.isNight();
  }

  isNight(): boolean {
    if (this.debugOverride !== null) return this.debugOverride;
    const hour = this.now().getHours();
    return hour < DAY_START_HOUR || hour >= NIGHT_START_HOUR;
  }

  // Re-evaluates against the current clock (or a debug override) and emits
  // daynight:changed only when the result actually flipped since the last
  // check — called periodically by StationScene (see its 60s timer), not on
  // every frame, since an hour-boundary crossing doesn't need finer polling.
  refresh(): void {
    const current = this.isNight();
    if (current !== this.lastKnown) {
      this.lastKnown = current;
      this.eventBus.emit('daynight:changed', { isNight: current });
    }
  }

  // Dev-only convenience — StationScene's debug key 'N' is gated behind
  // import.meta.env.DEV, so this never reaches real players. Cycles
  // day → night → back to real time, letting a developer preview both looks
  // without faking the system clock.
  debugCycleOverride(): void {
    if (this.debugOverride === null) this.debugOverride = true;
    else if (this.debugOverride === true) this.debugOverride = false;
    else this.debugOverride = null;
    this.refresh();
  }
}
