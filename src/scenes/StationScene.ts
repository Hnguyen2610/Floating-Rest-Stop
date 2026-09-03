import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PALETTE, FONT_FAMILY } from '../core/GameConfig';
import { getGameSystems, type GameSystems } from '../core/GameSystems';
import { Cloudy } from '../entities/Cloudy';
import { Guest, type GuestInteraction } from '../entities/Guest';
import { SunGuest } from '../guests/SunGuest';
import { MoonGuest } from '../guests/MoonGuest';
import { LittleStarGuest } from '../guests/LittleStarGuest';
import { ButterflyGuest } from '../guests/ButterflyGuest';
import { AuroraGuest } from '../guests/AuroraGuest';
import { CometGuest } from '../guests/CometGuest';
import { FloatingIngredient } from '../entities/FloatingIngredient';
import { HappinessCrystal } from '../entities/HappinessCrystal';
import { Decoration, type DecorationVisual } from '../entities/Decoration';
import { PhotoMomentIcon } from '../entities/PhotoMomentIcon';
import { InventoryUI } from '../ui/InventoryUI';
import { WeatherMixerUI } from '../ui/WeatherMixerUI';
import { CrystalCounter } from '../ui/CrystalCounter';
import { DecorationShopUI } from '../ui/DecorationShopUI';
import { PaperBoatUI } from '../ui/PaperBoatUI';
import { StationAreaShopUI } from '../ui/StationAreaShopUI';
import { CloudyCosmeticsShopUI } from '../ui/CloudyCosmeticsShopUI';
import { AudioSettingsUI } from '../ui/AudioSettingsUI';
import { RecipeBookUI } from '../ui/RecipeBookUI';
import { GuestHintUI } from '../ui/GuestHintUI';
import { BottomNavUI } from '../ui/BottomNavUI';
import { eventBus } from '../core/EventBus';
import { LocalSaveProvider } from '../services/save/LocalSaveProvider';
import type { GuestState } from '../types/guest';

const AREA_MARKER_SLOTS: Record<string, { x: number; y: number }> = {
  tea_corner: { x: 0.62, y: 0.52 },
  wind_garden: { x: 0.14, y: 0.52 },
  stargazing_corner: { x: 0.9, y: 0.15 },
  rain_garden: { x: 0.85, y: 0.52 },
};

export class StationScene extends Phaser.Scene {
  private systems!: GameSystems;
  private cloudy!: Cloudy;
  private mixerUI!: WeatherMixerUI;
  private guestHintUI!: GuestHintUI;
  private decorationShopUI!: DecorationShopUI;
  private paperBoatUI!: PaperBoatUI;
  private stationAreaShopUI!: StationAreaShopUI;
  private cloudyCosmeticsShopUI!: CloudyCosmeticsShopUI;
  private audioSettingsUI!: AudioSettingsUI;
  private recipeBookUI!: RecipeBookUI;
  private sky!: Phaser.GameObjects.Graphics;
  private dayNightButton!: Phaser.GameObjects.Text;
  private rareGuestIndicator: Phaser.GameObjects.Text | null = null;
  private rareGuestIndicatorFor: string | null = null;
  private drawnAreaMarkers = new Set<string>();
  private activeGuestEntity: Guest | null = null;
  private photoMomentIcon: PhotoMomentIcon | null = null;
  private floatingIngredients: FloatingIngredient[] = [];
  private departureTimer: Phaser.Time.TimerEvent | null = null;
  private butterflyStoryShown = false;
  private lastPolishSoundAt = 0;
  private readonly crystalCounterPosition = { x: GAME_WIDTH - 32, y: 32 };

  constructor() {
    super('StationScene');
  }

  create(): void {
    this.systems = getGameSystems();

    this.drawSky();
    this.drawPlatform();
    this.drawTitle();
    this.cloudy = new Cloudy(
      this,
      GAME_WIDTH / 2,
      GAME_HEIGHT * 0.48,
      this.systems.cloudyCosmeticsSystem.getEquippedShape(),
    );
    this.cloudy.setAccessories(this.systems.cloudyCosmeticsSystem.getEquippedAccessories());

    new InventoryUI(this, 24, 76, this.systems.ingredientSystem, this.systems.weatherSystem, (id) =>
      this.handleInventoryTap(id),
    );
    this.mixerUI = new WeatherMixerUI(
      this,
      GAME_WIDTH - 90,
      GAME_HEIGHT - 112,
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
      GAME_HEIGHT - 130,
      this.systems.decorationSystem,
    );
    this.paperBoatUI = new PaperBoatUI(this, this.systems.paperBoatSystem, this.systems.audioSystem);
    this.stationAreaShopUI = new StationAreaShopUI(
      this,
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      this.systems.stationAreaSystem,
    );
    this.cloudyCosmeticsShopUI = new CloudyCosmeticsShopUI(
      this,
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      this.systems.cloudyCosmeticsSystem,
      () => this.applyCloudyCosmetics(),
    );
    this.audioSettingsUI = new AudioSettingsUI(this, GAME_WIDTH / 2, GAME_HEIGHT / 2, this.systems.audioSystem);
    this.recipeBookUI = new RecipeBookUI(
      this,
      this.systems.weatherSystem,
      this.systems.ingredientSystem,
      this.systems.guestSystem,
    );
    this.drawMuteButton();
    this.drawDayNightToggle();
    this.drawRecipeBookButton();
    this.guestHintUI = new GuestHintUI(this, GAME_WIDTH * 0.24, GAME_HEIGHT * 0.42 - 100);
    this.drawBottomNav();

    this.wireEvents();
    this.resumeState();
    this.drawAreaMarkers();
    this.syncAmbience();

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
        // Skip while a rare guest is waiting to be invited, so an ordinary
        // guest can't race in and steal the earned rare-guest window.
        if (!this.systems.guestSystem.getCurrentGuest() && !this.rareGuestIndicatorFor) {
          this.spawnRandomGuest();
        }
      },
    });
    this.time.addEvent({
      delay: 2000,
      loop: true,
      callback: () => this.refreshRareGuestIndicator(),
    });

    this.wireDebugKeys();
  }

  private applyCloudyCosmetics(): void {
    this.cloudy.setShape(this.systems.cloudyCosmeticsSystem.getEquippedShape());
    this.cloudy.setAccessories(this.systems.cloudyCosmeticsSystem.getEquippedAccessories());
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
    this.butterflyStoryShown = false;
    const meta = this.systems.emotionSystem.getEmotionMeta(state.currentEmotion);
    const x = GAME_WIDTH * 0.24;
    const y = GAME_HEIGHT * 0.42;
    this.activeGuestEntity = this.createGuestEntity(state, meta, x, y);
    this.activeGuestEntity.playArrive();
    this.updateGuestHint(state, meta);

    // "Cloudy → chỗ nằm mềm": Cloudy visibly welcomes the tired flock in.
    if (state.id === 'butterfly') this.cloudy.playHappyBounce();
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
    this.refreshRareGuestIndicator();
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

  private readonly handlePaperBoatSent = ({ trustGuestId }: { trustGuestId: string | null }): void => {
    if (!trustGuestId) return;
    const definition = this.systems.guestSystem.getAllDefinitions().find((def) => def.id === trustGuestId);
    if (!definition) return;
    this.showToast(`💌 Lời nhắn của bạn đã sưởi ấm lòng ${definition.name}`);
  };

  private readonly handleAreaUnlocked = ({ id }: { id: string }): void => {
    this.drawAreaMarker(id);
    if (id === 'stargazing_corner') this.dayNightButton.setVisible(true);
    this.syncAmbience();
  };

  private readonly handleCloudyCosmeticUnlocked = ({ kind, id }: { kind: 'shape' | 'accessory'; id: string }): void => {
    const name =
      kind === 'shape'
        ? this.systems.cloudyCosmeticsSystem.getShapes().find((s) => s.id === id)?.name
        : this.systems.cloudyCosmeticsSystem.getAccessories().find((a) => a.id === id)?.name;
    if (name) this.showToast(`☁️ Mây Bông vừa mở khóa: ${name}`);
  };

  private wireEvents(): void {
    eventBus.on('guest:arrived', this.handleGuestArrived);
    eventBus.on('guest:left', this.handleGuestLeft);
    eventBus.on('guest:emotion-changed', this.handleEmotionChanged);
    eventBus.on('guest:relaxed', this.handleGuestRelaxed);
    eventBus.on('decoration:placed', this.handleDecorationPlaced);
    eventBus.on('paperboat:sent', this.handlePaperBoatSent);
    eventBus.on('area:unlocked', this.handleAreaUnlocked);
    eventBus.on('cloudyCosmetic:unlocked', this.handleCloudyCosmeticUnlocked);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      eventBus.off('guest:arrived', this.handleGuestArrived);
      eventBus.off('guest:left', this.handleGuestLeft);
      eventBus.off('guest:emotion-changed', this.handleEmotionChanged);
      eventBus.off('guest:relaxed', this.handleGuestRelaxed);
      eventBus.off('decoration:placed', this.handleDecorationPlaced);
      eventBus.off('paperboat:sent', this.handlePaperBoatSent);
      eventBus.off('area:unlocked', this.handleAreaUnlocked);
      eventBus.off('cloudyCosmetic:unlocked', this.handleCloudyCosmeticUnlocked);
    });
  }

  private resumeState(): void {
    this.systems.decorationSystem.getAllDefinitions().forEach((def) => {
      if (this.systems.decorationSystem.isUnlocked(def.id)) this.placeDecoration(def.id);
    });

    const currentGuest = this.systems.guestSystem.getCurrentGuest();
    if (currentGuest) this.handleGuestArrived(currentGuest);
  }

  // Two separate clusters (menu/customization bottom-left, active-play bottom-
  // right near the mixer) rather than one long row — matches the reference
  // layout's split rather than a single row spanning the whole width.
  private drawBottomNav(): void {
    new BottomNavUI(this, 64, GAME_HEIGHT - 50, [
      { icon: '📓', iconKey: 'nav-journal', label: 'Nhật ký', onTap: () => this.scene.start('JournalScene') },
      { icon: '🎨', iconKey: 'nav-decoration', label: 'Trang trí', onTap: () => this.decorationShopUI.toggle() },
      { icon: '🗺️', iconKey: 'nav-station', label: 'Mở rộng trạm', onTap: () => this.stationAreaShopUI.toggle() },
    ]);
    new BottomNavUI(this, 900, GAME_HEIGHT - 50, [
      { icon: '🎐', iconKey: 'nav-paperboat', label: 'Gửi lời nhắn', onTap: () => this.paperBoatUI.toggle() },
      { icon: '🌾', iconKey: 'nav-harvest', label: 'Thu hoạch', onTap: () => this.showFeatureComingSoon() },
      { icon: '☁️', iconKey: 'nav-cloudyshop', label: 'Mây Bông', onTap: () => this.cloudyCosmeticsShopUI.toggle() },
    ]);
  }

  private showFeatureComingSoon(): void {
    this.showToast('🔧 Tính năng đang phát triển');
  }

  private showToast(text: string): void {
    const toast = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.5, text, {
        fontFamily: FONT_FAMILY,
        fontSize: '18px',
        color: '#5b4a63',
        backgroundColor: '#fdfbf7',
        padding: { x: 16, y: 10 },
        align: 'center',
        wordWrap: { width: GAME_WIDTH * 0.7 },
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

    const settingsButton = this.add
      .text(GAME_WIDTH - 64, 70, '⚙️', { fontFamily: FONT_FAMILY, fontSize: '18px' })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    settingsButton.on('pointerdown', () => {
      this.audioSettingsUI.toggle();
      label.setText(audioSystem.isMuted() ? '🔇' : '🔊');
    });
  }

  // Manual day/night toggle (Pass 21) — only revealed once Stargazing Corner
  // is unlocked, since that's what gives the sky somewhere to point at night.
  private drawDayNightToggle(): void {
    const isNightIcon = () => (this.systems.dayNightSystem.isNight() ? '🌙' : '☀️');
    this.dayNightButton = this.add
      .text(GAME_WIDTH - 32, 104, isNightIcon(), { fontFamily: FONT_FAMILY, fontSize: '22px' })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    this.dayNightButton.on('pointerdown', () => {
      this.systems.dayNightSystem.toggle();
      this.dayNightButton.setText(isNightIcon());
      this.redrawSky();
      this.syncAmbience();
    });
    this.dayNightButton.setVisible(this.systems.stationAreaSystem.isUnlocked('stargazing_corner'));
  }

  // Sits right above the mixer bowl — exactly where a player wondering
  // "which ingredients make what?" is already looking.
  private drawRecipeBookButton(): void {
    const button = this.add
      .text(GAME_WIDTH - 90, GAME_HEIGHT - 112 - 66, '📖', { fontFamily: FONT_FAMILY, fontSize: '20px' })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    button.on('pointerdown', () => this.recipeBookUI.toggle());
  }

  private redrawSky(): void {
    const night = this.systems.dayNightSystem.isNight();
    this.sky.clear();
    if (night) {
      this.sky.fillGradientStyle(0x1c2340, 0x1c2340, 0x3a3564, 0x3a3564, 1);
    } else {
      this.sky.fillGradientStyle(PALETTE.skyTop, PALETTE.skyTop, PALETTE.skyBottom, PALETTE.skyBottom, 1);
    }
    this.sky.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }

  private syncAmbience(): void {
    this.systems.audioSystem.setAmbienceContext({
      isNight: this.systems.dayNightSystem.isNight(),
      hasWindGarden: this.systems.stationAreaSystem.isUnlocked('wind_garden'),
      hasRainGarden: this.systems.stationAreaSystem.isUnlocked('rain_garden'),
    });
  }

  private drawAreaMarkers(): void {
    this.systems.stationAreaSystem.getUnlockedIds().forEach((id) => this.drawAreaMarker(id));
  }

  private drawAreaMarker(id: string): void {
    if (this.drawnAreaMarkers.has(id)) return;
    const slot = AREA_MARKER_SLOTS[id];
    if (!slot) return; // small_cloud (the free starter area) has no marker of its own
    this.drawnAreaMarkers.add(id);

    const x = GAME_WIDTH * slot.x;
    const y = GAME_HEIGHT * slot.y;

    switch (id) {
      case 'tea_corner': {
        for (let i = 0; i < 3; i += 1) {
          const wisp = this.add.circle(x + (i - 1) * 6, y, 3, PALETTE.cloudWhite, 0.6);
          this.tweens.add({
            targets: wisp,
            y: y - 20,
            alpha: 0,
            duration: 1800 + i * 200,
            repeat: -1,
            delay: i * 400,
          });
        }
        break;
      }
      case 'wind_garden': {
        const pinwheel = this.add.graphics({ x, y });
        const colors = [PALETTE.pastelPink, PALETTE.mint, PALETTE.softYellow, PALETTE.lavender];
        colors.forEach((color, i) => {
          const angle = (i / colors.length) * Math.PI * 2;
          pinwheel.fillStyle(color, 0.8);
          pinwheel.beginPath();
          pinwheel.moveTo(0, 0);
          pinwheel.lineTo(Math.cos(angle) * 16, Math.sin(angle) * 16);
          pinwheel.lineTo(Math.cos(angle + 0.5) * 16, Math.sin(angle + 0.5) * 16);
          pinwheel.closePath();
          pinwheel.fillPath();
        });
        this.tweens.add({ targets: pinwheel, angle: 360, duration: 4000, repeat: -1, ease: 'Linear' });
        break;
      }
      case 'stargazing_corner': {
        for (let i = 0; i < 3; i += 1) {
          const star = this.add.text(x + i * 14 - 14, y + (i % 2) * 10, '✨', { fontSize: '12px' }).setOrigin(0.5);
          this.tweens.add({ targets: star, alpha: 0.2, duration: 900 + i * 150, yoyo: true, repeat: -1 });
        }
        break;
      }
      case 'rain_garden': {
        for (let i = 0; i < 3; i += 1) {
          const drop = this.add.circle(x + (i - 1) * 10, y - 14, 2, PALETTE.skyTop, 0.8);
          this.tweens.add({
            targets: drop,
            y: y + 14,
            alpha: 0,
            duration: 1200,
            repeat: -1,
            delay: i * 350,
          });
        }
        break;
      }
    }
  }

  // Rare guests never auto-spawn — this only surfaces an invite prompt once
  // RareGuestSystem's conditions are met, so arriving still feels earned.
  private refreshRareGuestIndicator(): void {
    if (this.systems.guestSystem.getCurrentGuest()) return;

    const available = this.systems.rareGuestSystem.isAuroraAvailable()
      ? 'aurora'
      : this.systems.rareGuestSystem.isCometAvailable()
        ? 'comet'
        : null;

    if (!available) {
      this.rareGuestIndicator?.destroy();
      this.rareGuestIndicator = null;
      this.rareGuestIndicatorFor = null;
      return;
    }

    if (this.rareGuestIndicatorFor === available) return;
    this.rareGuestIndicator?.destroy();
    this.rareGuestIndicatorFor = available;

    const icon = available === 'aurora' ? '🌌' : '☄️';
    const indicator = this.add
      .text(GAME_WIDTH * 0.5, GAME_HEIGHT * 0.25, `${icon} Một vị khách hiếm đang đến gần...`, {
        fontFamily: FONT_FAMILY,
        fontSize: '14px',
        color: '#5b4a63',
        backgroundColor: '#fdfbf7',
        padding: { x: 10, y: 6 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    this.tweens.add({ targets: indicator, alpha: 0.5, duration: 700, yoyo: true, repeat: -1 });
    indicator.on('pointerdown', () => {
      this.systems.guestSystem.spawn(available);
      indicator.destroy();
      this.rareGuestIndicator = null;
      this.rareGuestIndicatorFor = null;
    });

    this.rareGuestIndicator = indicator;
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
        ingredient.playLanded(() => ingredient.destroy());
        return;
      }
    }

    this.systems.ingredientSystem.collect(ingredient.definition.id);
    ingredient.playLanded(() => ingredient.destroy());
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
      case 'butterfly':
        return new ButterflyGuest(this, x, y, state, meta, onInteract);
      case 'aurora':
        return new AuroraGuest(this, x, y, state, meta, onInteract);
      case 'comet':
        return new CometGuest(this, x, y, state, meta, onInteract);
      default:
        throw new Error(`Unknown guest id: ${state.id}`);
    }
  }

  private handleGuestInteraction(interaction: GuestInteraction): void {
    const treatment = this.systems.guestSystem.getPreferredTreatment();
    if (!treatment) return;

    if (treatment.type === 'recipe' && interaction.type === 'tap') {
      const potionId = this.systems.weatherSystem.usePotion();
      if (!potionId) {
        // "Tap gently → nghe chuyện": a tap that isn't priming a potion would
        // otherwise do nothing — for Butterfly mid-chat, turn it into a story instead.
        this.tellButterflyStoryIfReady();
        return;
      }
      if (potionId === treatment.recipeId) {
        this.systems.guestSystem.soothe(this.systems.weatherSystem.getRecipe(potionId).soothingValue);
      }
      return;
    }

    if (treatment.type === 'direct' && interaction.type === 'rub') {
      this.systems.guestSystem.soothe(Math.min(interaction.distance, 15) * 0.1);
      this.playPolishSoundThrottled();
    }
  }

  // A rub interaction fires on every pointermove while dragging — throttle so
  // the polish sound stays a light texture instead of a spammy rattle.
  private playPolishSoundThrottled(): void {
    const now = this.time.now;
    if (now - this.lastPolishSoundAt < 180) return;
    this.lastPolishSoundAt = now;
    this.systems.audioSystem.playPolishSound();
  }

  private tellButterflyStoryIfReady(): void {
    if (this.butterflyStoryShown) return;
    const guest = this.systems.guestSystem.getCurrentGuest();
    if (!guest || guest.id !== 'butterfly' || guest.currentEmotion !== 'BUTTERFLY_CHATTING') return;

    const stories = (this.cache.json.get('stories') as Record<string, string[]>).butterfly ?? [];
    if (stories.length === 0) return;

    this.butterflyStoryShown = true;
    const story = Phaser.Utils.Array.GetRandom(stories);
    this.showToast(`🦋 ${story}`);
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
    if (!this.systems.journalSystem.canUnlockMemory(moment.memoryId)) return;

    const x = GAME_WIDTH * 0.24 + 55;
    const y = GAME_HEIGHT * 0.42 - 55;
    this.photoMomentIcon = new PhotoMomentIcon(this, x, y, () => {
      this.systems.photoMomentSystem.capture(state.id);
      this.systems.audioSystem.playCaptureSound();
      this.photoMomentIcon = null;
    });
  }

  private spawnRandomGuest(): void {
    // Rare guests (Aurora, Comet) never join the regular random pool — they
    // only arrive through the earned invite in refreshRareGuestIndicator().
    const definitions = this.systems.guestSystem.getAllDefinitions().filter((def) => !def.rare);
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
    this.input.keyboard?.on('keydown-FOUR', () => guestSystem.spawn('butterfly'));
    this.input.keyboard?.on('keydown-Q', () => guestSystem.leave());
    this.input.keyboard?.on('keydown-I', () => this.spawnIngredient());
    this.input.keyboard?.on('keydown-Z', () => {
      weatherSystem.addToMixer('morning_dew');
      weatherSystem.addToMixer('cool_breeze');
    });
    this.input.keyboard?.on('keydown-V', () => {
      weatherSystem.addToMixer('cool_breeze');
      weatherSystem.addToMixer('rainbow_fragment');
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
    this.input.keyboard?.on('keydown-N', () => {
      this.systems.dayNightSystem.toggle();
      this.dayNightButton.setText(this.systems.dayNightSystem.isNight() ? '🌙' : '☀️');
      this.redrawSky();
      this.syncAmbience();
    });
    this.input.keyboard?.on('keydown-B', () => {
      for (let i = 0; i < 30; i += 1) this.systems.happinessSystem.collectCrystal();
    });
    this.input.keyboard?.on('keydown-FIVE', () => guestSystem.spawn('aurora'));
    this.input.keyboard?.on('keydown-SIX', () => guestSystem.spawn('comet'));
    this.input.keyboard?.on('keydown-M', () => guestSystem.addTrust('moon', 40));
  }

  private drawSky(): void {
    this.sky = this.add.graphics();
    this.redrawSky();
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
