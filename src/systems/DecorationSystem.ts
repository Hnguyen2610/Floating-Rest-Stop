import type { TypedEventBus, GameEventMap } from '../core/EventBus';
import type { HappinessSystem } from './HappinessSystem';
import type { StationAreaSystem } from './StationAreaSystem';

export interface DecorationDefinition {
  id: string;
  name: string;
  cost: number;
  slotX: number;
  slotY: number;
  interactive: boolean;
  // Some decorations are gated behind a Station Area unlock (Pass 21) — the
  // area is the "decoration slot" becoming available, not a separate system.
  requiredAreaId?: string;
}

export interface DecorationsData {
  decorations: DecorationDefinition[];
}

export class DecorationSystem {
  private unlocked = new Set<string>();

  constructor(
    private data: DecorationsData,
    private happinessSystem: HappinessSystem,
    private stationAreaSystem: StationAreaSystem,
    private eventBus: TypedEventBus<GameEventMap>,
  ) {}

  getAllDefinitions(): DecorationDefinition[] {
    return this.data.decorations;
  }

  getDefinition(id: string): DecorationDefinition {
    const def = this.data.decorations.find((d) => d.id === id);
    if (!def) throw new Error(`Unknown decoration: ${id}`);
    return def;
  }

  isUnlocked(id: string): boolean {
    return this.unlocked.has(id);
  }

  isAvailable(id: string): boolean {
    const def = this.getDefinition(id);
    return !def.requiredAreaId || this.stationAreaSystem.isUnlocked(def.requiredAreaId);
  }

  unlock(id: string): boolean {
    if (this.unlocked.has(id)) return false;
    const def = this.getDefinition(id);
    if (!this.isAvailable(id)) return false;
    if (!this.happinessSystem.spendCrystals(def.cost)) return false;

    this.unlocked.add(id);
    this.eventBus.emit('decoration:unlocked', { id });
    this.eventBus.emit('decoration:placed', { id });
    return true;
  }

  getUnlockedIds(): string[] {
    return [...this.unlocked];
  }

  restoreUnlocked(ids: string[]): void {
    this.unlocked = new Set(ids);
  }
}
