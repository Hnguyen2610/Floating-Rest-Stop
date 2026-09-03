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
import { GuestHintUI } from '../ui/GuestHintUI';
import { BottomNavUI } from '../ui/BottomNavUI';
import { eventBus } from '../core/EventBus';
import { LocalSaveProvider } from '../services/save/LocalSaveProvider';
import type { GuestState } from '../types/guest';

export class StationScene extends Phaser.Scene {
  private systems!: GameSystems;
  private cloudy!: Cloudy;
  private mixerUI!: WeatherMixerUI;
  private guestHintUI!: GuestHintUI;
  private decorationShopUI!: DecorationShopUI;
  private activeGuestEntity: Guest | null = null;
  private photoMomentIcon: PhotoMomentIcon | null = null;
  private floatingIngredients: FloatingIngredient[] = [];
  private departureTimer: Phaser.Time.TimerEvent | null = null;
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

    new InventoryUI(this, 24, 76, this.systems.ingredientSystem, this.systems.weatherSystem, (id) =>
      this.handleInventoryTap(id),
    );
    this.mixerUI = new WeatherMixerUI(
      this,
      GAME_WIDTH - 90,
      GAME_HEIGHT - 90,
      this.systems.ingredientSystem,
      this.systems.weatherSystem,
      () => this.systems.audioSystem.playCraftSuccessSound(),
      () => this.systems.audioSystem.playCraftFailSound(),
    );
    new CrystalCounter(
      this,
      this.crystalCounterPosition.x,
      this.crystalCounterPosition.y,
      this.systems.happinessSystem,
    );
    this.decorationShopUI = new DecorationShopUI(
      this,
      GAME_WIDTH / 2,
      GAME_HEIGHT - 96,
      this.systems.decorationSystem,
    );
    this.drawMuteButton();
    this.guestHintUI = new GuestHintUI(this, GAME_WIDTH * 0.24, GAME_HEIGHT * 0.42 - 100);
    this.drawBottomNav();

    this.wireEvents();
    this.resumeState();

    this.time.addEvent({
      delay: 4000,
      loop: true,
      callback: () => {
        if (this.floatingIngredients.length < 4) this.spawnIngredient();
      },
    });
    this.time.addEvent({
      delay: 3000,
      loop: true,
      callback: () => {
        if (!this.systems.guestSystem.getCurrentGuest()) this.spawnRandomGuest();
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
    this.departureTimer?.remove();
    this.departureTimer = null;
    this.activeGuestEntity?.destroy();
    const meta = this.systems.emotionSystem.getEmotionMeta(state.currentEmotion);
    const x = GAME_WIDTH * 0.24;
    const y = GAME_HEIGHT * 0.42;
    this.activeGuestEntity = this.createGuestEntity(state, meta, x, y);
    this.activeGuestEntity.playArrive();
    this.updateGuestHint(state, meta);
  };

  private readonly handleGuestLeft = (): void => {
    this.departureTimer?.remove();
    this.departureTimer = null;
    const entity = this.activeGuestEntity;
    this.activeGuestEntity = null;
    entity?.playLeave(() => entity.destroy());
    this.photoMomentIcon?.destroy();
    this.photoMomentIcon = null;
    this.guestHintUI.showIdle();
  };

  private readonly handleEmotionChanged = (state: GuestState): void => {
    const meta = this.systems.emotionSystem.getEmotionMeta(state.currentEmotion);
    this.activeGuestEntity?.updateEmotion(meta);
    this.checkPhotoMoment(state);
    this.scheduleDepartureIfHappy(state);
    this.updateGuestHint(state, meta);
  };

  private updateGuestHint(state: GuestState, meta: { label: string; color: string; dialogue?: string[] }): void {
    const definition = this.systems.guestSystem
      .getAllDefinitions()
      .find((def) => def.id === state.id);
    if (!definition) return;

    const line =
      meta.dialogue && meta.dialogue.length > 0
        ? Phaser.Utils.Array.GetRandom(meta.dialogue)
        : definition.needHint;

    this.guestHintUI.show(definition.name, meta.label, line);
  }

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

  private drawBottomNav(): void {
    new BottomNavUI(this, 60, GAME_HEIGHT - 26, [
      { icon: '📓', label: 'Nhật ký', onTap: () => this.scene.start('JournalScene') },
      { icon: '🎨', label: 'Trang trí', onTap: () => this.decorationShopUI.toggle() },
      { icon: '🌾', label: 'Thu hoạch', onTap: () => this.showFeatureComingSoon() },
      { icon: '⚒️', label: 'Nâng cấp', onTap: () => this.showFeatureComingSoon() },
    ]);
  }

  private showFeatureComingSoon(): void {
    const toast = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.5, '🔧 Tính năng đang phát triển', {
        fontFamily: FONT_FAMILY,
        fontSize: '18px',
        color: '#5b4a63',
        backgroundColor: '#fdfbf7',
        padding: { x: 16, y: 10 },
      })
      .setOrigin(0.5)
      .setAlpha(0);
    this.tweens.add({
      targets: toast,
      alpha: 1,
      duration: 200,
      yoyo: true,
      hold: 1200,
      onComplete: () => toast.destroy(),
    });
  }

  private drawMuteButton(): void {
    const audioSystem = this.systems.audioSystem;
    const label = this.add
      .text(GAME_WIDTH - 32, 70, audioSystem.isMuted() ? '🔇' : '🔊', {
        fontFamily: FONT_FAMILY,
        fontSize: '22px',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    label.on('pointerdown', () => {
      audioSystem.setMuted(!audioSystem.isMuted());
      label.setText(audioSystem.isMuted() ? '🔇' : '🔊');
    });
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
        return;
      }
    }

    this.systems.ingredientSystem.collect(ingredient.definition.id);
    ingredient.destroy();
  }

  private handleInventoryTap(id: string): void {
    if (!this.systems.ingredientSystem.spend(id)) return;
    if (this.systems.weatherSystem.addToMixer(id)) {
      // Ingredient added to mixer successfully
    } else {
      // Mixer was full - give the ingredient back rather than losing it
      this.systems.ingredientSystem.collect(id);
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
    new HappinessCrystal(this, x, y, this.crystalCounterPosition, () => {
      this.systems.happinessSystem.collectCrystal();
      this.systems.audioSystem.playCollectSound();
    });
  }

  private checkPhotoMoment(state: GuestState): void {
    if (this.photoMomentIcon) return;
    if (this.systems.emotionSystem.getStage(state.emotionalIntensity) !== 'PEACEFUL') return;

    const moment = this.systems.photoMomentSystem.getMomentForGuest(state.id);
    if (!moment || this.systems.photoMomentSystem.isCaptured(moment.id)) return;

    const x = GAME_WIDTH * 0.24 + 55;
    const y = GAME_HEIGHT * 0.42 - 55;
    this.photoMomentIcon = new PhotoMomentIcon(this, x, y, () => {
      this.systems.photoMomentSystem.capture(state.id);
      this.systems.audioSystem.playCaptureSound();
      this.photoMomentIcon = null;
    });
  }

  private spawnRandomGuest(): void {
    const definitions = this.systems.guestSystem.getAllDefinitions();
    const definition = Phaser.Utils.Array.GetRandom(definitions);
    this.systems.guestSystem.spawn(definition.id);
  }

  private scheduleDepartureIfHappy(state: GuestState): void {
    if (this.departureTimer) return;
    if (this.systems.emotionSystem.getStage(state.emotionalIntensity) !== 'PEACEFUL') return;

    // Give the player a moment to see the Peaceful state and catch the photo
    // moment before the guest drifts off on their own — no countdown shown,
    // no penalty either way, matching the "no time pressure" brief.
    this.departureTimer = this.time.delayedCall(8000, () => {
      this.departureTimer = null;
      this.systems.guestSystem.leave();
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
      () => this.systems.audioSystem.playChimeSound(),
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
    });
    this.input.keyboard?.on('keydown-X', () => {
      weatherSystem.addToMixer('warm_sunbeam');
      weatherSystem.addToMixer('rainbow_fragment');
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
    this.add.text(16, 12, 'Trạm Dừng Chân Lơ Lửng', {
      fontFamily: FONT_FAMILY,
      fontSize: '20px',
      color: '#5b4a63',
    });
  }
}
