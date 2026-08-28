import Phaser from 'phaser';
import { PALETTE } from '../core/GameConfig';
import { eventBus } from '../core/EventBus';
import type { IngredientSystem } from '../systems/IngredientSystem';

export class WeatherMixerUI extends Phaser.GameObjects.Container {
  private readonly bowlRadius = 46;
  private slotIcons: Phaser.GameObjects.Graphics[] = [];

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    private ingredientSystem: IngredientSystem,
  ) {
    super(scene, x, y);
    scene.add.existing(this);

    const bowl = scene.add.graphics();
    bowl.fillStyle(PALETTE.lavender, 0.35);
    bowl.fillCircle(0, 0, this.bowlRadius);
    bowl.lineStyle(3, PALETTE.eyeColor, 0.4);
    bowl.strokeCircle(0, 0, this.bowlRadius);
    this.add(bowl);

    eventBus.on('mixer:updated', ({ contents }) => this.redrawContents(contents));
  }

  getDropZone(): Phaser.Geom.Circle {
    return new Phaser.Geom.Circle(this.x, this.y, this.bowlRadius);
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
