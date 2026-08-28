import type { TypedEventBus, GameEventMap } from '../core/EventBus';

export class HappinessSystem {
  private crystalCount = 0;

  constructor(private eventBus: TypedEventBus<GameEventMap>) {}

  collectCrystal(): number {
    this.crystalCount += 1;
    this.eventBus.emit('happiness:collected', { count: this.crystalCount });
    return this.crystalCount;
  }

  spendCrystals(amount: number): boolean {
    if (this.crystalCount < amount) return false;
    this.crystalCount -= amount;
    this.eventBus.emit('happiness:spent', { count: this.crystalCount });
    return true;
  }

  getCount(): number {
    return this.crystalCount;
  }

  restoreCount(count: number): void {
    this.crystalCount = count;
  }
}
