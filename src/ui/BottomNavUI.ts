import Phaser from 'phaser';
import { PALETTE, FONT_FAMILY } from '../core/GameConfig';

export interface NavItem {
  icon: string;
  /** Texture key for the illustrated icon — falls back to the emoji in `icon` when absent, e.g. for a not-yet-illustrated feature. */
  iconKey?: string;
  label: string;
  onTap: () => void;
}

const CARD_SIZE = 76;
const CARD_STRIDE = 92;
const ICON_TARGET_WIDTH = 46;

export class BottomNavUI {
  constructor(scene: Phaser.Scene, x: number, y: number, items: NavItem[]) {
    items.forEach((item, index) => {
      const itemX = x + index * CARD_STRIDE;
      const button = scene.add.container(itemX, y);

      const half = CARD_SIZE / 2;

      const shadow = scene.add.graphics();
      shadow.fillStyle(0x000000, 0.1);
      shadow.fillRoundedRect(-half + 3, -half + 6, CARD_SIZE, CARD_SIZE, 22);
      button.add(shadow);

      // Fluffy cloud-card frame: a rounded-rect body with a couple of small
      // puff bumps along the top edge so it reads as a cloud-shaped card
      // rather than a plain rounded square.
      const card = scene.add.graphics();
      card.fillStyle(PALETTE.cloudWhite, 0.97);
      card.fillRoundedRect(-half, -half, CARD_SIZE, CARD_SIZE, 22);
      card.fillCircle(-half + 16, -half + 4, 13);
      card.fillCircle(half - 16, -half + 4, 13);
      card.lineStyle(2, PALETTE.eyeColor, 0.22);
      card.strokeRoundedRect(-half, -half, CARD_SIZE, CARD_SIZE, 22);
      button.add(card);

      let icon: Phaser.GameObjects.Text | Phaser.GameObjects.Image;
      if (item.iconKey && scene.textures.exists(item.iconKey)) {
        const image = scene.add.image(0, -12, item.iconKey);
        image.setScale(ICON_TARGET_WIDTH / image.frame.width);
        icon = image;
      } else {
        icon = scene.add.text(0, -12, item.icon, { fontSize: '30px' }).setOrigin(0.5);
      }
      button.add(icon);

      const label = scene.add
        .text(0, half - 16, item.label, {
          fontFamily: FONT_FAMILY,
          fontSize: '11px',
          color: '#5b4a63',
          align: 'center',
          wordWrap: { width: CARD_SIZE - 8 },
          lineSpacing: 1,
        })
        .setOrigin(0.5);
      button.add(label);

      button.setSize(CARD_SIZE, CARD_SIZE);
      // Container hit-test coords are relative to the top-left of setSize(), not the
      // container's origin — a full-coverage rect matching setSize() exactly starts at (0,0).
      button.setInteractive(
        new Phaser.Geom.Rectangle(0, 0, CARD_SIZE, CARD_SIZE),
        Phaser.Geom.Rectangle.Contains,
      );
      button.on('pointerdown', () => {
        scene.tweens.add({ targets: button, scale: 0.92, duration: 60, yoyo: true });
        item.onTap();
      });
    });
  }
}
