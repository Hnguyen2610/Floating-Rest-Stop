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
import { getAllRegisteredAssets } from '../core/AssetRegistry';

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

    this.load.image('ingredient-morning_dew', 'assets/ingredients/morning_dew.png');
    this.load.image('ingredient-warm_sunbeam', 'assets/ingredients/warm_sunbeam.png');
    this.load.image('ingredient-cool_breeze', 'assets/ingredients/cool_breeze.png');
    this.load.image('ingredient-rainbow_fragment', 'assets/ingredients/rainbow_fragment.png');
    this.load.image('ingredient-star_dust', 'assets/ingredients/star_dust.png');

    this.load.image('nav-journal', 'assets/nav/journal.png');
    this.load.image('nav-decoration', 'assets/nav/decoration.png');
    this.load.image('nav-paperboat', 'assets/nav/paperboat.png');
    this.load.image('nav-harvest', 'assets/nav/harvest.png');
    this.load.image('nav-station', 'assets/nav/station.png');
    this.load.image('nav-cloudyshop', 'assets/nav/cloudyshop.png');

    this.load.image('cloudy-default-idle', 'assets/cloudy/default/idle.png');
    this.load.image('cloudy-default-happy', 'assets/cloudy/default/happy.png');
    this.load.image('cloudy-default-poke', 'assets/cloudy/default/poke.png');
    this.load.image('cloudy-default-sleepy', 'assets/cloudy/default/sleepy.png');
    this.load.image('cloudy-cotton_candy-idle', 'assets/cloudy/cotton_candy/idle.png');
    this.load.image('cloudy-heart-idle', 'assets/cloudy/heart/idle.png');

    this.load.image('accessory-sunset_hat', 'assets/accessories/sunset_hat.png');
    this.load.image('accessory-star_clip', 'assets/accessories/star_clip.png');
    this.load.image('accessory-rainbow_ribbon', 'assets/accessories/rainbow_ribbon.png');
    // New accessory variations
    this.load.image('accessory-rainbow_ribbon_pink', 'assets/accessories/rainbow_ribbon_pink.png');
    this.load.image('accessory-rainbow_ribbon_lavender', 'assets/accessories/rainbow_ribbon_lavender.png');
    this.load.image('accessory-star_clip_mint', 'assets/accessories/star_clip_mint.png');
    this.load.image('accessory-star_clip_yellow', 'assets/accessories/star_clip_yellow.png');
    this.load.image('accessory-sunset_hat_pink', 'assets/accessories/sunset_hat_pink.png');
    this.load.image('accessory-sunset_hat_mint', 'assets/accessories/sunset_hat_mint.png');

    // Particle effects
    this.load.image('sparkle', 'assets/particles/sparkle.png');

    // Illustrated art registered in AssetRegistry (guest emotion stages, etc.)
    getAllRegisteredAssets().forEach((asset) => {
      if (asset.texturePath) {
        this.load.image(asset.key, asset.texturePath);
      }
    });
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