import type { TypedEventBus, GameEventMap } from '../core/EventBus';
import type { HappinessSystem } from './HappinessSystem';

export interface DecorationDefinition {
  id: string;
  name: string;
  cost: number;
  slotX: number;
  slotY: number;
  interactive: boolean;
}

export interface DecorationsData {
  decorations: DecorationDefinition[];
}

export class DecorationSystem {
  private unlocked = new Set<string>();

  constructor(
    private data: DecorationsData,
    private happinessSystem: HappinessSystem,
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

  unlock(id: string): boolean {
    if (this.unlocked.has(id)) return false;
    const def = this.getDefinition(id);
    if (!this.happinessSystem.spendCrystals(def.cost)) return false;

    this.unlocked.add(id);
    this.eventBus.emit('decoration:unlocked', { id });
    this.eventBus.emit('decoration:placed', { id });
    return true;
  }
}
