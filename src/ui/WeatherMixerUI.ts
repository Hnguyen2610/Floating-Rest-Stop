import Phaser from 'phaser';
import { PALETTE, FONT_FAMILY } from '../core/GameConfig';
import { eventBus } from '../core/EventBus';
import { createButton } from './Button';
import { blendHexColors } from './liquidBlend';
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
  private craftButton: Phaser.GameObjects.Container;
  private slotBgGraphics: Phaser.GameObjects.Graphics;
  private readonly liquidGraphics: Phaser.GameObjects.Graphics;

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

    // Liquid fill — grows and re-blends color as ingredients are added,
    // drawn over the bowl and under the slot backgrounds/icons.
    this.liquidGraphics = scene.add.graphics();
    this.add(this.liquidGraphics);

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
    this.craftButton = createButton(scene, 0, this.bowlRadius + 50, 'CHẾ TẠO', () => this.handleCraft());
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
    const contentsBeforeCraft = this.weatherSystem.getMixerContents();
    const success = this.weatherSystem.tryCraft();
    if (success) {
      this.scene.tweens.add({ targets: this, scale: 1.08, duration: 100, yoyo: true });
      this.onCraftSuccess();
    } else {
      // Wrong combo — give the ingredients back to inventory and empty the
      // bowl instead of leaving them stuck with no visible way to swap one
      // out (real player confusion: pressed CHẾ TẠO with a wrong combo,
      // ingredients stayed in the bowl, no obvious next step).
      contentsBeforeCraft.forEach((id) => this.ingredientSystem.collect(id));
      this.weatherSystem.clearMixer();
      this.playCraftFail();
      this.onCraftFail();
    }
  }

  private showPotionReady(recipeId: string): void {
    const recipe = this.weatherSystem.getRecipe(recipeId);
    this.potionLabel.setText(`Sẵn sàng: ${recipe.name}`);
    this.scene.tweens.add({ targets: this, scale: 1.12, duration: 120, yoyo: true });
  }

  // Grows from an empty bowl to a full pool as ingredients are added,
  // re-blending its color from every ingredient currently in the mixer
  // (see liquidBlend.ts) — a visible, colorful cue for what's being mixed
  // instead of relying on the small ingredient icons alone.
  private updateLiquidFill(contents: string[]): void {
    this.liquidGraphics.clear();
    if (contents.length === 0) return;

    const colors = contents.map((id) => this.ingredientSystem.getDefinition(id).color);
    const blended = blendHexColors(colors);
    const fillRatio = contents.length / MIXER_CAPACITY;
    const radius = this.bowlRadius * (0.35 + 0.35 * fillRatio);

    this.liquidGraphics.fillStyle(blended, 0.55);
    this.liquidGraphics.fillCircle(0, this.bowlRadius * 0.15, radius);

    // Gentle "plop" wobble each time the fill changes — one-shot, not a
    // looping animation, matching this project's "Subtle > Flashy" VFX rule.
    this.scene.tweens.add({
      targets: this.liquidGraphics,
      scaleX: 1.08,
      scaleY: 0.92,
      duration: 180,
      yoyo: true,
      ease: 'Sine.easeOut',
    });
  }

  private updateMixerContents(contents: string[]): void {
    this.updateLiquidFill(contents);

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
      icon.on('pointerdown', () => {
        const removed = this.weatherSystem.removeFromMixer(index);
        if (removed) this.ingredientSystem.collect(removed);
      });
      this.add(icon);
      this.slotIcons.push(icon);
    });
  }
}