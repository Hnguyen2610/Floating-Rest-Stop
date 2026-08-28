import Phaser from 'phaser';
import { PALETTE } from '../core/GameConfig';
import { eventBus } from '../core/EventBus';
import type { IngredientSystem } from '../systems/IngredientSystem';
import type { WeatherSystem } from '../systems/WeatherSystem';

export class WeatherMixerUI extends Phaser.GameObjects.Container {
  private readonly bowlRadius = 46;
  private slotIcons: Phaser.GameObjects.Graphics[] = [];
  private readonly potionLabel: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    private ingredientSystem: IngredientSystem,
    private weatherSystem: WeatherSystem,
  ) {
    super(scene, x, y);
    scene.add.existing(this);

    const bowl = scene.add.graphics();
    bowl.fillStyle(PALETTE.lavender, 0.35);
    bowl.fillCircle(0, 0, this.bowlRadius);
    bowl.lineStyle(3, PALETTE.eyeColor, 0.4);
    bowl.strokeCircle(0, 0, this.bowlRadius);
    this.add(bowl);

    this.potionLabel = scene.add
      .text(0, this.bowlRadius + 16, '', {
        fontFamily: 'Georgia, serif',
        fontSize: '14px',
        color: '#5b4a63',
      })
      .setOrigin(0.5);
    this.add(this.potionLabel);

    eventBus.on('mixer:updated', ({ contents }) => this.redrawContents(contents));
    eventBus.on('weather:created', ({ recipeId }) => this.showPotionReady(recipeId));
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

  private showPotionReady(recipeId: string): void {
    const recipe = this.weatherSystem.getRecipe(recipeId);
    this.potionLabel.setText(`Sẵn sàng: ${recipe.name}`);
    this.scene.tweens.add({ targets: this, scale: 1.12, duration: 120, yoyo: true });
  }

  private redrawContents(contents: string[]): void {
    this.slotIcons.forEach((icon) => icon.destroy());
    this.slotIcons = contents.map((id, index) => {
      const definition = this.ingredientSystem.getDefinition(id);
      const color = parseInt(definition.color.replace('#', ''), 16);
      const icon = this.scene.add.graphics();
      icon.fillStyle(color, 1);
      const offsetX = index === 0 ? -14 : 14;
      icon.fillCircle(offsetX, 6, 12);
      this.add(icon);
      return icon;
    });
  }
}
