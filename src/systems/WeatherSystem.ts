import type { TypedEventBus, GameEventMap } from '../core/EventBus';

const MIXER_CAPACITY = 2;

export interface RecipeDefinition {
  id: string;
  name: string;
  ingredients: string[];
  visualEffect: string;
  suitableEmotions: string[];
  suitableGuests: string[];
  soothingValue: number;
}

export interface RecipesData {
  recipes: RecipeDefinition[];
}

function sameIngredients(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((id, index) => id === sortedB[index]);
}

export class WeatherSystem {
  private mixerContents: string[] = [];
  private currentPotion: string | null = null;

  constructor(
    private recipesData: RecipesData,
    private eventBus: TypedEventBus<GameEventMap>,
  ) {}

  /** Add ingredient to mixer slot if available */
  addToMixer(ingredientId: string): boolean {
    if (this.mixerContents.length >= MIXER_CAPACITY) return false;
    this.mixerContents.push(ingredientId);
    this.eventBus.emit('mixer:updated', { contents: [...this.mixerContents] });
    return true;
  }

  /** Remove ingredient from mixer by index */
  removeFromMixer(index: number): string | null {
    if (index < 0 || index >= this.mixerContents.length) return null;
    const removed = this.mixerContents.splice(index, 1)[0];
    this.eventBus.emit('mixer:updated', { contents: [...this.mixerContents] });
    return removed;
  }

  /** Get mixer contents */
  getMixerContents(): string[] {
    return [...this.mixerContents];
  }

  /** Check if mixer has space */
  hasMixerSpace(): boolean {
    return this.mixerContents.length < MIXER_CAPACITY;
  }

  /** Clear mixer */
  clearMixer(): void {
    this.mixerContents = [];
    this.eventBus.emit('mixer:updated', { contents: [] });
  }

  getRecipe(id: string): RecipeDefinition {
    const recipe = this.recipesData.recipes.find((r) => r.id === id);
    if (!recipe) throw new Error(`Unknown recipe: ${id}`);
    return recipe;
  }

  tryCraft(): boolean {
    const match = this.recipesData.recipes.find((recipe) =>
      sameIngredients(recipe.ingredients, this.mixerContents),
    );
    if (!match) return false;

    this.currentPotion = match.id;
    this.mixerContents = [];
    this.eventBus.emit('mixer:updated', { contents: [] });
    this.eventBus.emit('weather:created', { recipeId: match.id });
    return true;
  }

  getCurrentPotion(): string | null {
    return this.currentPotion;
  }

  usePotion(): string | null {
    const potion = this.currentPotion;
    if (!potion) return null;
    this.currentPotion = null;
    this.eventBus.emit('weather:used', { recipeId: potion });
    return potion;
  }
}