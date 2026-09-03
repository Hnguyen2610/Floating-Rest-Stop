import Phaser from 'phaser';
import { PALETTE, FONT_FAMILY } from '../core/GameConfig';
import { eventBus } from '../core/EventBus';
import type { IngredientSystem } from '../systems/IngredientSystem';
import type { WeatherSystem } from '../systems/WeatherSystem';

const MIXER_CAPACITY = 2;
const SLOT_SIZE = 24;
const SLOT_SPACING = 8;
const SLOT_ICON_WIDTH = 22;

export class WeatherMixerUI extends Phaser.GameObjects.Container {
  private readonly bowlRadius = 46;
  private slotIcons: Phaser.GameObjects.Image[] = [];
  private readonly potionLabel: Phaser.GameObjects.Text;
  private craftButton: Phaser.GameObjects.Text;
  private slotBgGraphics: Phaser.GameObjects.Graphics;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    _ingredientSystem: IngredientSystem,
    private weatherSystem: WeatherSystem,
    private onCraftSuccess: () => void,
    private onCraftFail: () => void,
  ) {
    super(scene, x, y);
    scene.add.existing(this);

    // Bowl
    const bowl = scene.add.graphics();
    bowl.fillStyle(PALETTE.lavender, 0.35);
    bowl.fillCircle(0, 0, this.bowlRadius);
    bowl.lineStyle(3, PALETTE.eyeColor, 0.4);
    bowl.strokeCircle(0, 0, this.bowlRadius);
    this.add(bowl);

    // Slot backgrounds
    this.slotBgGraphics = scene.add.graphics();
    this.add(this.slotBgGraphics);

    // Slot icons (ingredients)
    this.slotIcons = [];

    // Potion label
    this.potionLabel = scene.add
      .text(0, this.bowlRadius + 24, '', {
        fontFamily: FONT_FAMILY,
        fontSize: '14px',
        color: '#5b4a63',
      })
      .setOrigin(0.5);
    this.add(this.potionLabel);

    // Craft button
    this.craftButton = scene.add
      .text(0, this.bowlRadius + 50, 'CHẾ TẠO', {
        fontFamily: FONT_FAMILY,
        fontSize: '12px',
        color: '#ffffff',
        backgroundColor: '#8b7355',
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    this.craftButton.on('pointerdown', () => this.handleCraft());
    this.add(this.craftButton);

    // Event listeners — unregistered on destroy (see below), otherwise this
    // container's listeners keep firing on the singleton eventBus after a
    // scene transition destroys it (e.g. Journal round-trip), crashing on
    // `this.scene` being null by then.
    const onMixerUpdated = ({ contents }: { contents: string[] }) => this.updateMixerContents(contents);
    const onWeatherCreated = ({ recipeId }: { recipeId: string }) => this.showPotionReady(recipeId);
    const onWeatherUsed = () => this.potionLabel.setText('');
    eventBus.on('mixer:updated', onMixerUpdated);
    eventBus.on('weather:created', onWeatherCreated);
    eventBus.on('weather:used', onWeatherUsed);
    this.once(Phaser.GameObjects.Events.DESTROY, () => {
      eventBus.off('mixer:updated', onMixerUpdated);
      eventBus.off('weather:created', onWeatherCreated);
      eventBus.off('weather:used', onWeatherUsed);
    });

    // Initial update
    this.updateMixerContents(this.weatherSystem.getMixerContents());
  }

  getDropZone(): Phaser.Geom.Circle {
    return new Phaser.Geom.Circle(this.x, this.y, this.bowlRadius);
  }

  playCraftFail(): void {
    this.scene.tweens.add({
      targets: this,
      x: this.x - 8,
      duration: 60,
      yoyo: true,
      repeat: 3,
      ease: 'Sine.easeInOut',
    });
  }

  private handleCraft(): void {
    const success = this.weatherSystem.tryCraft();
    if (success) {
      this.scene.tweens.add({ targets: this, scale: 1.08, duration: 100, yoyo: true });
      this.onCraftSuccess();
    } else {
      this.playCraftFail();
      this.onCraftFail();
    }
  }

  private showPotionReady(recipeId: string): void {
    const recipe = this.weatherSystem.getRecipe(recipeId);
    this.potionLabel.setText(`Sẵn sàng: ${recipe.name}`);
    this.scene.tweens.add({ targets: this, scale: 1.12, duration: 120, yoyo: true });
  }

  private updateMixerContents(contents: string[]): void {
    // Update slot backgrounds
    this.slotBgGraphics.clear();
    this.slotBgGraphics.fillStyle(0x000000, 0.2);

    for (let i = 0; i < MIXER_CAPACITY; i++) {
      const slotX = (i - MIXER_CAPACITY / 2 + 0.5) * (SLOT_SIZE + SLOT_SPACING);
      this.slotBgGraphics.fillRect(
        slotX - SLOT_SIZE / 2,
        -SLOT_SIZE / 2,
        SLOT_SIZE,
        SLOT_SIZE
      );
      this.slotBgGraphics.lineStyle(2, 0x5b4a63, 0.3);
      this.slotBgGraphics.strokeRect(
        slotX - SLOT_SIZE / 2,
        -SLOT_SIZE / 2,
        SLOT_SIZE,
        SLOT_SIZE
      );
    }

    // Update slot icons
    this.slotIcons.forEach((icon) => icon.destroy());
    this.slotIcons = [];

    contents.forEach((id, index) => {
      if (index >= MIXER_CAPACITY) return;

      const slotX = (index - MIXER_CAPACITY / 2 + 0.5) * (SLOT_SIZE + SLOT_SPACING);

      const icon = this.scene.add.image(0, 0, `ingredient-${id}`);
      icon.setScale(SLOT_ICON_WIDTH / icon.width);
      icon.x = slotX;
      icon.y = 0;
      icon.setInteractive(new Phaser.Geom.Rectangle(-SLOT_SIZE / 2, -SLOT_SIZE / 2, SLOT_SIZE, SLOT_SIZE), Phaser.Geom.Rectangle.Contains);
      icon.on('pointerdown', () => this.weatherSystem.removeFromMixer(index));
      this.add(icon);
      this.slotIcons.push(icon);
    });
  }
}