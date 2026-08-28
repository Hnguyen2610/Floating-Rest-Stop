import { Guest } from '../entities/Guest';
import { PALETTE } from '../core/GameConfig';

export class MoonGuest extends Guest {
  protected renderBody(graphics: Phaser.GameObjects.Graphics): void {
    const color = this.hexToColor(this.emotionMeta.color);
    const radius = 40;

    graphics.fillStyle(color, 1);
    graphics.fillCircle(0, 0, radius);
    graphics.fillStyle(PALETTE.skyTop, 1);
    graphics.fillCircle(16, -6, radius * 0.85);
  }
}
