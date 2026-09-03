import Phaser from 'phaser';
import { createGameSystems } from '../core/GameSystems';
import { LocalSaveProvider } from '../services/save/LocalSaveProvider';
import type { GuestsData } from '../systems/GuestSystem';
import type { EmotionsData } from '../systems/EmotionSystem';
import type { IngredientsData } from '../systems/IngredientSystem';
import type { RecipesData } from '../systems/WeatherSystem';
import type { DecorationsData } from '../systems/DecorationSystem';
import type { JournalData } from '../systems/JournalSystem';
import type { PhotoMomentsData } from '../systems/PhotoMomentSystem';
import type { PaperMessagesData } from '../systems/PaperBoatSystem';

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
    this.load.json('photoMoments', 'data/photoMoments.json');
    this.load.json('messages', 'data/messages.json');
    this.load.json('stickers', 'data/stickers.json');
    this.load.json('stories', 'data/stories.json');
  }

  create(): void {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    const systems = await createGameSystems(
      {
        guests: this.cache.json.get('guests') as GuestsData,
        emotions: this.cache.json.get('emotions') as EmotionsData,
        ingredients: this.cache.json.get('ingredients') as IngredientsData,
        recipes: this.cache.json.get('recipes') as RecipesData,
        decorations: this.cache.json.get('decorations') as DecorationsData,
        journal: this.cache.json.get('journal') as JournalData,
        photoMoments: this.cache.json.get('photoMoments') as PhotoMomentsData,
        messages: this.cache.json.get('messages') as PaperMessagesData,
      },
      new LocalSaveProvider(),
    );
    window.addEventListener('beforeunload', () => {
      systems.saveSystem.saveNow().catch(() => undefined);
    });
    this.scene.start('StationScene');
  }
}
