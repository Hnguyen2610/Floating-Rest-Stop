import type { TypedEventBus, GameEventMap } from '../core/EventBus';
import type { HappinessSystem } from './HappinessSystem';

export interface AreaDefinition {
  id: string;
  name: string;
  cost: number;
  order: number;
}

export interface AreasData {
  areas: AreaDefinition[];
}

export class StationAreaSystem {
  private unlocked = new Set<string>();

  constructor(
    private data: AreasData,
    private happinessSystem: HappinessSystem,
    private eventBus: TypedEventBus<GameEventMap>,
  ) {
    // Free areas (cost 0, e.g. the starting "Small Floating Cloud") are owned from the start.
    data.areas.filter((area) => area.cost === 0).forEach((area) => this.unlocked.add(area.id));
  }

  getAllDefinitions(): AreaDefinition[] {
    return [...this.data.areas].sort((a, b) => a.order - b.order);
  }

  isUnlocked(id: string): boolean {
    return this.unlocked.has(id);
  }

  unlock(id: string): boolean {
    if (this.unlocked.has(id)) return false;
    const def = this.data.areas.find((area) => area.id === id);
    if (!def) return false;
    if (!this.happinessSystem.spendCrystals(def.cost)) return false;

    this.unlocked.add(id);
    this.eventBus.emit('area:unlocked', { id });
    return true;
  }

  getUnlockedIds(): string[] {
    return [...this.unlocked];
  }

  restoreUnlocked(ids: string[]): void {
    const defaults = this.data.areas.filter((area) => area.cost === 0).map((area) => area.id);
    this.unlocked = new Set([...defaults, ...ids]);
  }
}
