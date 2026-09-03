import Phaser from 'phaser';
import { createGameSystems } from '../core/GameSystems';
import { getPlatformAdapter } from '../core/Platform';
import { LocalSaveProvider } from '../services/save/LocalSaveProvider';
import { YouTubePlayablesSaveProvider } from '../services/save/YouTubePlayablesSaveProvider';
import type { SaveProvider } from '../services/save/SaveProvider';
import type { GuestsData } from '../systems/GuestSystem';
import type { EmotionsData } from '../systems/EmotionSystem';
import type { IngredientsData } from '../systems/IngredientSystem';
import type { RecipesData } from '../systems/WeatherSystem';
import type { AreasData } from '../systems/StationAreaSystem';
import type { DecorationsData } from '../systems/DecorationSystem';
import type { JournalData } from '../systems/JournalSystem';
import type { PhotoMomentsData } from '../systems/PhotoMomentSystem';
import type { PaperMessagesData } from '../systems/PaperBoatSystem';
import type { CloudyCosmeticsData } from '../systems/CloudyCosmeticsSystem';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload(): void {
    this.load.json('guests', 'data/guests.json');
    this.load.json('emotions', 'data/emotions.json');
    this.load.json('ingredients', 'data/ingredients.json');
    this.load.json('recipes', 'data/recipes.json');
    this.load.json('areas', 'data/areas.json');
    this.load.json('decorations', 'data/decorations.json');
    this.load.json('journal', 'data/journal.json');
    this.load.json('photoMoments', 'data/photoMoments.json');
    this.load.json('messages', 'data/messages.json');
    this.load.json('stickers', 'data/stickers.json');
    this.load.json('stories', 'data/stories.json');
    this.load.json('cloudyCosmetics', 'data/cloudyCosmetics.json');
  }

  create(): void {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    const platform = getPlatformAdapter();
    const saveProvider: SaveProvider = platform.isPlayablesEnv
      ? new YouTubePlayablesSaveProvider()
      : new LocalSaveProvider();

    const systems = await createGameSystems(
      {
        guests: this.cache.json.get('guests') as GuestsData,
        emotions: this.cache.json.get('emotions') as EmotionsData,
        ingredients: this.cache.json.get('ingredients') as IngredientsData,
        recipes: this.cache.json.get('recipes') as RecipesData,
        areas: this.cache.json.get('areas') as AreasData,
        decorations: this.cache.json.get('decorations') as DecorationsData,
        journal: this.cache.json.get('journal') as JournalData,
        photoMoments: this.cache.json.get('photoMoments') as PhotoMomentsData,
        messages: this.cache.json.get('messages') as PaperMessagesData,
        cloudyCosmetics: this.cache.json.get('cloudyCosmetics') as CloudyCosmeticsData,
      },
      saveProvider,
    );
    window.addEventListener('beforeunload', () => {
      systems.saveSystem.saveNow().catch(() => undefined);
    });

    systems.audioSystem.setMuted(!platform.isAudioEnabled());
    platform.onAudioEnabledChange((enabled) => systems.audioSystem.setMuted(!enabled));

    platform.signalGameReady();
    this.scene.start('StationScene');
  }
}
