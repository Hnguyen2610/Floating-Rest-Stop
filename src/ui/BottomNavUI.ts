import Phaser from 'phaser';
import { PALETTE, FONT_FAMILY } from '../core/GameConfig';

export interface NavItem {
  icon: string;
  label: string;
  onTap: () => void;
}

export class BottomNavUI {
  constructor(scene: Phaser.Scene, x: number, y: number, items: NavItem[]) {
    items.forEach((item, index) => {
      const itemX = x + index * 84;
      const button = scene.add.container(itemX, y);

      const bg = scene.add.circle(0, 0, 24, PALETTE.cloudWhite, 0.9).setStrokeStyle(1, PALETTE.eyeColor, 0.25);
      const icon = scene.add.text(0, 0, item.icon, { fontSize: '20px' }).setOrigin(0.5);
      const label = scene.add
        .text(0, 30, item.label, { fontFamily: FONT_FAMILY, fontSize: '10px', color: '#5b4a63' })
        .setOrigin(0.5);
      button.add([bg, icon, label]);

      button.setSize(48, 48);
      // Container hit-test coords are relative to the top-left of setSize(), not the
      // container's origin, so a centered circle must sit at (width/2, height/2).
      button.setInteractive(new Phaser.Geom.Circle(24, 24, 24), Phaser.Geom.Circle.Contains);
      button.on('pointerdown', () => {
        scene.tweens.add({ targets: button, scale: 0.9, duration: 60, yoyo: true });
        item.onTap();
      });
    });
  }
}
