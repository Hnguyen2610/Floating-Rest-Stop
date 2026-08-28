import Phaser from 'phaser';
import { createGameSystems } from '../core/GameSystems';
import type { GuestsData } from '../systems/GuestSystem';
import type { EmotionsData } from '../systems/EmotionSystem';
import type { IngredientsData } from '../systems/IngredientSystem';
import type { RecipesData } from '../systems/WeatherSystem';
import type { DecorationsData } from '../systems/DecorationSystem';
import type { JournalData } from '../systems/JournalSystem';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload(): void {
    this.load.json('guests', 'data/guests.json');
    this.load.json('emotions', 'data/emotions.json');
    this.load.json('ingredients', 'data/ingredients.json');
    this.load.json('recipes', 'data/recipes.json');
    this.load.json('decorations', 'data/decorations.json');
    this.load.json('journal', 'data/journal.json');
  }

  create(): void {
    createGameSystems({
      guests: this.cache.json.get('guests') as GuestsData,
      emotions: this.cache.json.get('emotions') as EmotionsData,
      ingredients: this.cache.json.get('ingredients') as IngredientsData,
      recipes: this.cache.json.get('recipes') as RecipesData,
      decorations: this.cache.json.get('decorations') as DecorationsData,
      journal: this.cache.json.get('journal') as JournalData,
    });
    this.scene.start('StationScene');
  }
}
