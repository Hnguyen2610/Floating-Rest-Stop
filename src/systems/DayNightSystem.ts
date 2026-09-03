import type { TypedEventBus, GameEventMap } from '../core/EventBus';

// A manual toggle rather than a real-time clock — matches the "no time
// pressure" cozy brief (Pass 27 rule: no artificial waiting) while still
// giving Aurora's "night station" condition something concrete to check.
export class DayNightSystem {
  private night = false;

  constructor(private eventBus: TypedEventBus<GameEventMap>) {}

  isNight(): boolean {
    return this.night;
  }

  toggle(): boolean {
    this.night = !this.night;
    this.eventBus.emit('daynight:changed', { isNight: this.night });
    return this.night;
  }

  restoreIsNight(isNight: boolean): void {
    this.night = isNight;
  }
}
