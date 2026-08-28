import Phaser from 'phaser';
import { PALETTE } from '../core/GameConfig';
import { eventBus } from '../core/EventBus';
import type { DecorationSystem } from '../systems/DecorationSystem';

export class DecorationShopUI {
  private backgrounds = new Map<string, Phaser.GameObjects.Arc>();

  constructor(
    private scene: Phaser.Scene,
    x: number,
    y: number,
    private decorationSystem: DecorationSystem,
  ) {
    decorationSystem.getAllDefinitions().forEach((def, index) => {
      const itemX = x + index * 40;
      const item = scene.add.container(itemX, y);

      const bg = scene.add.circle(
        0,
        0,
        16,
        PALETTE.lavender,
        decorationSystem.isUnlocked(def.id) ? 0.9 : 0.35,
      );
      const label = scene.add
        .text(0, 22, String(def.cost), {
          fontFamily: 'Georgia, serif',
          fontSize: '12px',
          color: '#5b4a63',
        })
        .setOrigin(0.5);
      item.add([bg, label]);

      item.setSize(36, 36);
      // Container hit-test coords are relative to the top-left of setSize(), not the
      // container's origin, so a centered circle must sit at (width/2, height/2).
      item.setInteractive(new Phaser.Geom.Circle(18, 18, 18), Phaser.Geom.Circle.Contains);
      item.on('pointerdown', () => this.tryUnlock(def.id, bg));

      this.backgrounds.set(def.id, bg);
    });

    eventBus.on('decoration:unlocked', ({ id }) => {
      this.backgrounds.get(id)?.setAlpha(0.9);
    });
  }

  private tryUnlock(id: string, bg: Phaser.GameObjects.Arc): void {
    if (this.decorationSystem.isUnlocked(id)) return;
    if (!this.decorationSystem.unlock(id)) {
      this.scene.tweens.add({ targets: bg, x: bg.x - 4, duration: 60, yoyo: true, repeat: 3 });
    }
  }
}
