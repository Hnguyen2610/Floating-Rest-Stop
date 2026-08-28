import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PALETTE, FONT_FAMILY } from '../core/GameConfig';
import { getGameSystems, type GameSystems } from '../core/GameSystems';
import { Cloudy } from '../entities/Cloudy';
import { Guest, type GuestInteraction } from '../entities/Guest';
import { SunGuest } from '../guests/SunGuest';
import { MoonGuest } from '../guests/MoonGuest';
import { LittleStarGuest } from '../guests/LittleStarGuest';
import { FloatingIngredient } from '../entities/FloatingIngredient';
import { HappinessCrystal } from '../entities/HappinessCrystal';
import { Decoration, type DecorationVisual } from '../entities/Decoration';
import { PhotoMomentIcon } from '../entities/PhotoMomentIcon';
import { InventoryUI } from '../ui/InventoryUI';
import { WeatherMixerUI } from '../ui/WeatherMixerUI';
import { CrystalCounter } from '../ui/CrystalCounter';
import { DecorationShopUI } from '../ui/DecorationShopUI';
import { eventBus } from '../core/EventBus';
import { LocalSaveProvider } from '../services/save/LocalSaveProvider';
import type { GuestState } from '../types/guest';

export class StationScene extends Phaser.Scene {
  private systems!: GameSystems;
  private cloudy!: Cloudy;
  private mixerUI!: WeatherMixerUI;
  private activeGuestEntity: Guest | null = null;
  private photoMomentIcon: PhotoMomentIcon | null = null;
  private floatingIngredients: FloatingIngredient[] = [];
  private readonly crystalCounterPosition = { x: GAME_WIDTH - 32, y: 32 };

  constructor() {
    super('StationScene');
  }

  create(): void {
    this.systems = getGameSystems();

    this.drawSky();
    this.drawPlatform();
    this.drawTitle();
    this.cloudy = new Cloudy(this, GAME_WIDTH / 2, GAME_HEIGHT * 0.48);

    new InventoryUI(this, 24, 32, this.systems.ingredientSystem);
    this.mixerUI = new WeatherMixerUI(
      this,
      GAME_WIDTH - 90,
      GAME_HEIGHT - 90,
      this.systems.ingredientSystem,
      this.systems.weatherSystem,
    );
    new CrystalCounter(
      this,
      this.crystalCounterPosition.x,
      this.crystalCounterPosition.y,
      this.systems.happinessSystem,
    );
    new DecorationShopUI(this, 24, GAME_HEIGHT - 24, this.systems.decorationSystem);
    this.drawJournalButton();

    this.wireEvents();
    this.resumeState();

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

  private readonly handleGuestArrived = (state: GuestState): void => {
    this.activeGuestEntity?.destroy();
    const meta = this.systems.emotionSystem.getEmotionMeta(state.currentEmotion);
    const x = GAME_WIDTH * 0.24;
    const y = GAME_HEIGHT * 0.42;
    this.activeGuestEntity = this.createGuestEntity(state, meta, x, y);
    this.activeGuestEntity.playArrive();
  };

  private readonly handleGuestLeft = (): void => {
    const entity = this.activeGuestEntity;
    if (!entity) return;
    this.activeGuestEntity = null;
    entity.playLeave(() => entity.destroy());
    this.photoMomentIcon?.destroy();
    this.photoMomentIcon = null;
  };

  private readonly handleEmotionChanged = (state: GuestState): void => {
    const meta = this.systems.emotionSystem.getEmotionMeta(state.currentEmotion);
    this.activeGuestEntity?.updateEmotion(meta);
    this.checkPhotoMoment(state);
  };

  private readonly handleGuestRelaxed = (): void => this.spawnHappinessCrystal();

  private readonly handleDecorationPlaced = ({ id }: { id: string }): void =>
    this.placeDecoration(id);

  private wireEvents(): void {
    eventBus.on('guest:arrived', this.handleGuestArrived);
    eventBus.on('guest:left', this.handleGuestLeft);
    eventBus.on('guest:emotion-changed', this.handleEmotionChanged);
    eventBus.on('guest:relaxed', this.handleGuestRelaxed);
    eventBus.on('decoration:placed', this.handleDecorationPlaced);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      eventBus.off('guest:arrived', this.handleGuestArrived);
      eventBus.off('guest:left', this.handleGuestLeft);
      eventBus.off('guest:emotion-changed', this.handleEmotionChanged);
      eventBus.off('guest:relaxed', this.handleGuestRelaxed);
      eventBus.off('decoration:placed', this.handleDecorationPlaced);
    });
  }

  private resumeState(): void {
    this.systems.decorationSystem.getAllDefinitions().forEach((def) => {
      if (this.systems.decorationSystem.isUnlocked(def.id)) this.placeDecoration(def.id);
    });

    const currentGuest = this.systems.guestSystem.getCurrentGuest();
    if (currentGuest) this.handleGuestArrived(currentGuest);
  }

  private drawJournalButton(): void {
    const button = this.add
      .text(GAME_WIDTH - 100, GAME_HEIGHT - 24, '📖 Nhật ký', {
        fontFamily: FONT_FAMILY,
        fontSize: '16px',
        color: '#5b4a63',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    button.on('pointerdown', () => this.scene.start('JournalScene'));
  }

  private spawnIngredient(): void {
    const definition = Phaser.Utils.Array.GetRandom(this.systems.ingredientSystem.getAllDefinitions());
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
      if (this.systems.weatherSystem.addToMixer(ingredient.definition.id)) {
        ingredient.destroy();
        this.tryAutoCraft();
        return;
      }
    }

    this.systems.ingredientSystem.collect(ingredient.definition.id);
    ingredient.destroy();
  }

  private tryAutoCraft(): void {
    if (this.systems.weatherSystem.getMixerContents().length < 2) return;
    const success = this.systems.weatherSystem.tryCraft();
    if (!success) {
      this.mixerUI.playCraftFail();
      this.time.delayedCall(500, () => this.systems.weatherSystem.clearMixer());
    }
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
    const treatment = this.systems.guestSystem.getPreferredTreatment();
    if (!treatment) return;

    if (treatment.type === 'recipe' && interaction.type === 'tap') {
      const potionId = this.systems.weatherSystem.usePotion();
      if (!potionId) return;
      if (potionId === treatment.recipeId) {
        this.systems.guestSystem.soothe(this.systems.weatherSystem.getRecipe(potionId).soothingValue);
      }
      return;
    }

    if (treatment.type === 'direct' && interaction.type === 'rub') {
      this.systems.guestSystem.soothe(Math.min(interaction.distance, 15) * 0.1);
    }
  }

  private spawnHappinessCrystal(): void {
    const x = GAME_WIDTH * 0.24;
    const y = GAME_HEIGHT * 0.42 - 70;
    new HappinessCrystal(this, x, y, this.crystalCounterPosition, () =>
      this.systems.happinessSystem.collectCrystal(),
    );
  }

  private checkPhotoMoment(state: GuestState): void {
    if (this.photoMomentIcon) return;
    if (this.systems.emotionSystem.getStage(state.emotionalIntensity) !== 'HAPPY') return;

    const moment = this.systems.photoMomentSystem.getMomentForGuest(state.id);
    if (!moment || this.systems.photoMomentSystem.isCaptured(moment.id)) return;

    const x = GAME_WIDTH * 0.24 + 55;
    const y = GAME_HEIGHT * 0.42 - 55;
    this.photoMomentIcon = new PhotoMomentIcon(this, x, y, () => {
      this.systems.photoMomentSystem.capture(state.id);
      this.photoMomentIcon = null;
    });
  }

  private placeDecoration(id: string): void {
    const def = this.systems.decorationSystem.getDefinition(id);
    new Decoration(
      this,
      GAME_WIDTH * def.slotX,
      GAME_HEIGHT * def.slotY,
      id as DecorationVisual,
      def.interactive,
    );
  }

  private wireDebugKeys(): void {
    if (!import.meta.env.DEV) return;
    const { guestSystem, weatherSystem, happinessSystem, photoMomentSystem } = this.systems;
    this.input.keyboard?.on('keydown-H', () => this.cloudy.playHappyBounce());
    this.input.keyboard?.on('keydown-ONE', () => guestSystem.spawn('sun'));
    this.input.keyboard?.on('keydown-TWO', () => guestSystem.spawn('moon'));
    this.input.keyboard?.on('keydown-THREE', () => guestSystem.spawn('little_star'));
    this.input.keyboard?.on('keydown-Q', () => guestSystem.leave());
    this.input.keyboard?.on('keydown-I', () => this.spawnIngredient());
    this.input.keyboard?.on('keydown-Z', () => {
      weatherSystem.addToMixer('morning_dew');
      weatherSystem.addToMixer('cool_breeze');
      this.tryAutoCraft();
    });
    this.input.keyboard?.on('keydown-X', () => {
      weatherSystem.addToMixer('warm_sunbeam');
      weatherSystem.addToMixer('rainbow_fragment');
      this.tryAutoCraft();
    });
    this.input.keyboard?.on('keydown-C', () => happinessSystem.collectCrystal());
    this.input.keyboard?.on('keydown-J', () => {
      const guestId = guestSystem.getCurrentGuest()?.id ?? 'sun';
      photoMomentSystem.capture(guestId);
    });
    this.input.keyboard?.on('keydown-R', () => {
      new LocalSaveProvider().clear().then(() => window.location.reload());
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
        fontFamily: FONT_FAMILY,
        fontSize: '40px',
        color: '#5b4a63',
      })
      .setOrigin(0.5);
  }
}
