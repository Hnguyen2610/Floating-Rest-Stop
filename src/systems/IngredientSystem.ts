import type { TypedEventBus, GameEventMap } from '../core/EventBus';

export interface IngredientDefinition {
  id: string;
  name: string;
  color: string;
}

export interface IngredientsData {
  ingredients: IngredientDefinition[];
}

export class IngredientSystem {
  private inventory = new Map<string, number>();

  constructor(
    private data: IngredientsData,
    private eventBus: TypedEventBus<GameEventMap>,
  ) {}

  getAllDefinitions(): IngredientDefinition[] {
    return this.data.ingredients;
  }

  getDefinition(id: string): IngredientDefinition {
    const definition = this.data.ingredients.find((ingredient) => ingredient.id === id);
    if (!definition) throw new Error(`Unknown ingredient: ${id}`);
    return definition;
  }

  collect(id: string): void {
    this.getDefinition(id);
    const count = (this.inventory.get(id) ?? 0) + 1;
    this.inventory.set(id, count);
    this.eventBus.emit('ingredient:collected', { id, count });
  }

  getCount(id: string): number {
    return this.inventory.get(id) ?? 0;
  }

  spend(id: string): boolean {
    const count = this.inventory.get(id) ?? 0;
    if (count <= 0) return false;
    this.inventory.set(id, count - 1);
    this.eventBus.emit('ingredient:spent', { id, count: count - 1 });
    return true;
  }
}
