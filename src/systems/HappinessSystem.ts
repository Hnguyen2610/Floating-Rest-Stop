import type { TypedEventBus, GameEventMap } from '../core/EventBus';

export class HappinessSystem {
  private crystalCount = 0;

  constructor(private eventBus: TypedEventBus<GameEventMap>) {}

  collectCrystal(): number {
    this.crystalCount += 1;
    this.eventBus.emit('happiness:collected', { count: this.crystalCount });
    return this.crystalCount;
  }

  getCount(): number {
    return this.crystalCount;
  }
}
