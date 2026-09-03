import Phaser from 'phaser';
import { PALETTE, FONT_FAMILY } from '../core/GameConfig';
import { eventBus } from '../core/EventBus';
import type { IngredientSystem } from '../systems/IngredientSystem';
import type { WeatherSystem } from '../systems/WeatherSystem';

const MIXER_CAPACITY = 2;
const SLOT_SIZE = 24;
const SLOT_SPACING = 8;

export class WeatherMixerUI extends Phaser.GameObjects.Container {
  private readonly bowlRadius = 46;
  private slotIcons: Phaser.GameObjects.Graphics[] = [];
  private readonly potionLabel: Phaser.GameObjects.Text;
  private craftButton: Phaser.GameObjects.Text;
  private slotBgGraphics: Phaser.GameObjects.Graphics;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    private ingredientSystem: IngredientSystem,
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

    // Event listeners
    eventBus.on('mixer:updated', ({ contents }) => this.updateMixerContents(contents));
    eventBus.on('weather:created', ({ recipeId }) => this.showPotionReady(recipeId));
    eventBus.on('weather:used', () => this.potionLabel.setText(''));

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

      const definition = this.ingredientSystem.getDefinition(id);
      const color = parseInt(definition.color.replace('#', ''), 16);
      const slotX = (index - MIXER_CAPACITY / 2 + 0.5) * (SLOT_SIZE + SLOT_SPACING);

      const icon = this.scene.add.graphics();
      icon.fillStyle(color, 0.8);

      // Different shapes for different ingredients
      switch (id) {
        case 'morning_dew':
          // Droplet shape
          icon.fillCircle(0, -4, 6);
          icon.fillRect(-2, 2, 4, 8);
          break;
        case 'warm_sunbeam':
          // Sun rays
          icon.fillCircle(0, 0, 5);
          for (let angle = 0; angle < 360; angle += 45) {
            const rad = (angle * Math.PI) / 180;
            const x1 = Math.cos(rad) * 3;
            const y1 = Math.sin(rad) * 3;
            const x2 = Math.cos(rad) * 6;
            const y2 = Math.sin(rad) * 6;
            icon.fillRect(x1 - 1, y1 - 1, 2, 2);
            icon.fillRect(x2 - 1, y2 - 1, 2, 2);
          }
          break;
        case 'cool_breeze':
          // Swirl
          icon.fillCircle(-3, -3, 2);
          icon.fillCircle(3, 3, 2);
          icon.fillCircle(-3, 3, 2);
          icon.fillCircle(3, -3, 2);
          break;
        case 'rainbow_fragment':
          // Rainbow arc
          for (let i = 0; i < 3; i++) {
            icon.fillStyle(
              parseInt(['#ff6b6b', '#4ecdc4', '#45b7d1'][i].replace('#', ''), 16),
              0.8
            );
            icon.slice(-4 + i * 4, -4, 8, Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(180), false);
            icon.fillPath();
          }
          break;
        case 'star_dust':
          // Sparkles
          icon.fillCircle(0, 0, 3);
          icon.fillRect(-5, -1, 10, 2);
          icon.fillRect(-1, -5, 2, 10);
          break;
        default:
          // Default circle
          icon.fillCircle(0, 0, 6);
          break;
      }

      icon.x = slotX;
      icon.y = 0;
      icon.setInteractive(new Phaser.Geom.Rectangle(-SLOT_SIZE / 2, -SLOT_SIZE / 2, SLOT_SIZE, SLOT_SIZE), Phaser.Geom.Rectangle.Contains);
      icon.on('pointerdown', () => this.weatherSystem.removeFromMixer(index));
      this.add(icon);
      this.slotIcons.push(icon);
    });
  }
}