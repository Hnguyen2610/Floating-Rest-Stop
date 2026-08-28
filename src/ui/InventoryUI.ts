import Phaser from 'phaser';
import { FONT_FAMILY } from '../core/GameConfig';
import { eventBus } from '../core/EventBus';
import type { IngredientSystem } from '../systems/IngredientSystem';

export class InventoryUI extends Phaser.GameObjects.Container {
  private counts = new Map<string, Phaser.GameObjects.Text>();

  constructor(scene: Phaser.Scene, x: number, y: number, ingredientSystem: IngredientSystem) {
    super(scene, x, y);
    scene.add.existing(this);

    ingredientSystem.getAllDefinitions().forEach((definition, index) => {
      const rowY = index * 30;
      const color = parseInt(definition.color.replace('#', ''), 16);
      const dot = scene.add.circle(0, rowY, 8, color);
      const label = scene.add.text(16, rowY - 9, String(ingredientSystem.getCount(definition.id)), {
        fontFamily: FONT_FAMILY,
        fontSize: '18px',
        color: '#5b4a63',
      });
      this.add([dot, label]);
      this.counts.set(definition.id, label);
    });

    eventBus.on('ingredient:collected', ({ id, count }) => {
      this.counts.get(id)?.setText(String(count));
    });
  }
}
