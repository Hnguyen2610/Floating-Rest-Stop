import Phaser from 'phaser';
import { FONT_FAMILY } from '../core/GameConfig';
import { eventBus } from '../core/EventBus';
import type { IngredientSystem } from '../systems/IngredientSystem';
import type { WeatherSystem } from '../systems/WeatherSystem';

const ROW_HEIGHT = 30;
const ROW_WIDTH = 70;

export class InventoryUI extends Phaser.GameObjects.Container {
  private counts = new Map<string, Phaser.GameObjects.Text>();

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    ingredientSystem: IngredientSystem,
    _weatherSystem: WeatherSystem,
    private onTap: (id: string) => void,
  ) {
    super(scene, x, y);
    scene.add.existing(this);

    ingredientSystem.getAllDefinitions().forEach((definition, index) => {
      const rowY = index * ROW_HEIGHT;
      const color = parseInt(definition.color.replace('#', ''), 16);

      // Top-left anchored: setInteractive() with no explicit shape auto-fits
      // a rectangle to setSize() starting at local (0,0), so children here
      // are laid out from (0,0) too rather than centered on the row origin.
      const row = scene.add.container(0, rowY);
      const dot = scene.add.circle(8, 11, 8, color);
      const label = scene.add.text(20, 2, String(ingredientSystem.getCount(definition.id)), {
        fontFamily: FONT_FAMILY,
        fontSize: '18px',
        color: '#5b4a63',
      });
      row.add([dot, label]);

      row.setSize(ROW_WIDTH, ROW_HEIGHT);
      row.setInteractive({ useHandCursor: true });
      row.on('pointerdown', () => this.onTap(definition.id));

      this.add(row);
      this.counts.set(definition.id, label);
    });

    eventBus.on('ingredient:collected', ({ id, count }) => {
      this.counts.get(id)?.setText(String(count));
    });
    eventBus.on('ingredient:spent', ({ id, count }) => {
      this.counts.get(id)?.setText(String(count));
    });
  }
}
