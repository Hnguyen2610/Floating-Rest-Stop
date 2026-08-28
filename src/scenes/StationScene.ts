import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PALETTE } from '../core/GameConfig';
import { Cloudy } from '../entities/Cloudy';
import { Guest, type GuestInteraction } from '../entities/Guest';
import { SunGuest } from '../guests/SunGuest';
import { MoonGuest } from '../guests/MoonGuest';
import { LittleStarGuest } from '../guests/LittleStarGuest';
import { EmotionSystem, type EmotionsData } from '../systems/EmotionSystem';
import { GuestSystem, type GuestsData } from '../systems/GuestSystem';
import { IngredientSystem, type IngredientsData } from '../systems/IngredientSystem';
import { WeatherSystem, type RecipesData } from '../systems/WeatherSystem';
import { HappinessSystem } from '../systems/HappinessSystem';
import { FloatingIngredient } from '../entities/FloatingIngredient';
import { HappinessCrystal } from '../entities/HappinessCrystal';
import { InventoryUI } from '../ui/InventoryUI';
import { WeatherMixerUI } from '../ui/WeatherMixerUI';
import { CrystalCounter } from '../ui/CrystalCounter';
import { eventBus } from '../core/EventBus';
import type { GuestState } from '../types/guest';

export class StationScene extends Phaser.Scene {
  private cloudy!: Cloudy;
  private emotionSystem!: EmotionSystem;
  private guestSystem!: GuestSystem;
  private ingredientSystem!: IngredientSystem;
  private weatherSystem!: WeatherSystem;
  private happinessSystem!: HappinessSystem;
  private mixerUI!: WeatherMixerUI;
  private activeGuestEntity: Guest | null = null;
  private floatingIngredients: FloatingIngredient[] = [];
  private readonly crystalCounterPosition = { x: GAME_WIDTH - 32, y: 32 };

  constructor() {
    super('StationScene');
  }

  create(): void {
    this.drawSky();
    this.drawPlatform();
    this.drawTitle();
    this.cloudy = new Cloudy(this, GAME_WIDTH / 2, GAME_HEIGHT * 0.48);

    const guestsData = this.cache.json.get('guests') as GuestsData;
    const emotionsData = this.cache.json.get('emotions') as EmotionsData;
    const ingredientsData = this.cache.json.get('ingredients') as IngredientsData;
    const recipesData = this.cache.json.get('recipes') as RecipesData;
    this.emotionSystem = new EmotionSystem(emotionsData);
    this.guestSystem = new GuestSystem(guestsData, this.emotionSystem, eventBus);
    this.ingredientSystem = new IngredientSystem(ingredientsData, eventBus);
    this.weatherSystem = new WeatherSystem(recipesData, eventBus);
    this.happinessSystem = new HappinessSystem(eventBus);

    new InventoryUI(this, 24, 32, this.ingredientSystem);
    this.mixerUI = new WeatherMixerUI(
      this,
      GAME_WIDTH - 90,
      GAME_HEIGHT - 90,
      this.ingredientSystem,
      this.weatherSystem,
    );
    new CrystalCounter(this, this.crystalCounterPosition.x, this.crystalCounterPosition.y);

    eventBus.on('guest:arrived', (state) => this.onGuestArrived(state));
    eventBus.on('guest:left', () => this.onGuestLeft());
    eventBus.on('guest:emotion-changed', (state) => {
      const meta = this.emotionSystem.getEmotionMeta(state.currentEmotion);
      this.activeGuestEntity?.updateEmotion(meta);
    });
    eventBus.on('guest:relaxed', () => this.spawnHappinessCrystal());

    this.time.addEvent({
      delay: 4000,
      loop: true,
      callback: () => {
        if (this.floatingIngredients.length < 4) this.spawnIngredient();
      },
    });

    this.wireDebugKeys();
  }

  update(time: number, delta: number): void {
    this.cloudy.update(time, delta);
    this.activeGuestEntity?.update(time, delta);
    this.floatingIngredients.forEach((ingredient) => ingredient.update(time, delta));
  }

  private spawnIngredient(): void {
    const definition = Phaser.Utils.Array.GetRandom(this.ingredientSystem.getAllDefinitions());
    const x = Phaser.Math.Between(GAME_WIDTH * 0.55, GAME_WIDTH * 0.88);
    const y = Phaser.Math.Between(GAME_HEIGHT * 0.28, GAME_HEIGHT * 0.55);
    const ingredient = new FloatingIngredient(this, x, y, definition, (ing, sx, sy) =>
      this.handleIngredientDropped(ing, sx, sy),
    );
    this.floatingIngredients.push(ingredient);
  }

  private handleIngredientDropped(
    ingredient: FloatingIngredient,
    screenX: number,
    screenY: number,
  ): void {
    this.floatingIngredients = this.floatingIngredients.filter((i) => i !== ingredient);

    const dropZone = this.mixerUI.getDropZone();
    if (Phaser.Geom.Circle.Contains(dropZone, screenX, screenY)) {
      if (this.weatherSystem.addToMixer(ingredient.definition.id)) {
        ingredient.destroy();
        this.tryAutoCraft();
        return;
      }
    }

    this.ingredientSystem.collect(ingredient.definition.id);
    ingredient.destroy();
  }

  private tryAutoCraft(): void {
    if (this.weatherSystem.getMixerContents().length < 2) return;
    const success = this.weatherSystem.tryCraft();
    if (!success) {
      this.mixerUI.playCraftFail();
      this.time.delayedCall(500, () => this.weatherSystem.clearMixer());
    }
  }

  private onGuestArrived(state: GuestState): void {
    this.activeGuestEntity?.destroy();
    const meta = this.emotionSystem.getEmotionMeta(state.currentEmotion);
    const x = GAME_WIDTH * 0.24;
    const y = GAME_HEIGHT * 0.42;
    this.activeGuestEntity = this.createGuestEntity(state, meta, x, y);
    this.activeGuestEntity.playArrive();
  }

  private createGuestEntity(
    state: GuestState,
    meta: { label: string; color: string },
    x: number,
    y: number,
  ): Guest {
    const onInteract = (interaction: GuestInteraction) => this.handleGuestInteraction(interaction);
    switch (state.id) {
      case 'sun':
        return new SunGuest(this, x, y, state, meta, onInteract);
      case 'moon':
        return new MoonGuest(this, x, y, state, meta, onInteract);
      case 'little_star':
        return new LittleStarGuest(this, x, y, state, meta, onInteract);
      default:
        throw new Error(`Unknown guest id: ${state.id}`);
    }
  }

  private handleGuestInteraction(interaction: GuestInteraction): void {
    const treatment = this.guestSystem.getPreferredTreatment();
    if (!treatment) return;

    if (treatment.type === 'recipe' && interaction.type === 'tap') {
      const potionId = this.weatherSystem.usePotion();
      if (!potionId) return;
      if (potionId === treatment.recipeId) {
        this.guestSystem.soothe(this.weatherSystem.getRecipe(potionId).soothingValue);
      }
      return;
    }

    if (treatment.type === 'direct' && interaction.type === 'rub') {
      this.guestSystem.soothe(Math.min(interaction.distance, 15) * 0.1);
    }
  }

  private spawnHappinessCrystal(): void {
    const x = GAME_WIDTH * 0.24;
    const y = GAME_HEIGHT * 0.42 - 70;
    new HappinessCrystal(this, x, y, this.crystalCounterPosition, () =>
      this.happinessSystem.collectCrystal(),
    );
  }

  private onGuestLeft(): void {
    const entity = this.activeGuestEntity;
    if (!entity) return;
    this.activeGuestEntity = null;
    entity.playLeave(() => entity.destroy());
  }

  private wireDebugKeys(): void {
    if (!import.meta.env.DEV) return;
    this.input.keyboard?.on('keydown-H', () => this.cloudy.playHappyBounce());
    this.input.keyboard?.on('keydown-ONE', () => this.guestSystem.spawn('sun'));
    this.input.keyboard?.on('keydown-TWO', () => this.guestSystem.spawn('moon'));
    this.input.keyboard?.on('keydown-THREE', () => this.guestSystem.spawn('little_star'));
    this.input.keyboard?.on('keydown-Q', () => this.guestSystem.leave());
    this.input.keyboard?.on('keydown-I', () => this.spawnIngredient());
    this.input.keyboard?.on('keydown-Z', () => {
      this.weatherSystem.addToMixer('morning_dew');
      this.weatherSystem.addToMixer('cool_breeze');
      this.tryAutoCraft();
    });
    this.input.keyboard?.on('keydown-X', () => {
      this.weatherSystem.addToMixer('warm_sunbeam');
      this.weatherSystem.addToMixer('rainbow_fragment');
      this.tryAutoCraft();
    });
  }

  private drawSky(): void {
    const sky = this.add.graphics();
    sky.fillGradientStyle(PALETTE.skyTop, PALETTE.skyTop, PALETTE.skyBottom, PALETTE.skyBottom, 1);
    sky.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }

  private drawPlatform(): void {
    const platform = this.add.graphics();
    const centerX = GAME_WIDTH / 2;
    const centerY = GAME_HEIGHT * 0.72;

    platform.fillStyle(PALETTE.cloudWhite, 1);
    platform.fillEllipse(centerX, centerY, 420, 140);
    platform.fillStyle(PALETTE.mint, 0.5);
    platform.fillEllipse(centerX - 90, centerY - 20, 160, 70);
    platform.fillStyle(PALETTE.pastelPink, 0.5);
    platform.fillEllipse(centerX + 110, centerY - 10, 140, 60);
  }

  private drawTitle(): void {
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.18, 'Trạm Dừng Chân Lơ Lửng', {
        fontFamily: 'Georgia, serif',
        fontSize: '40px',
        color: '#5b4a63',
      })
      .setOrigin(0.5);
  }
}
