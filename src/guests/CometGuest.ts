import { Guest } from '../entities/Guest';

// A bright head with a tapering trail of decreasing, fading circles.
const TRAIL_LENGTH = 6;

export class CometGuest extends Guest {
  protected renderBody(graphics: Phaser.GameObjects.Graphics): void {
    const color = this.hexToColor(this.emotionMeta.color);

    for (let i = TRAIL_LENGTH; i >= 1; i -= 1) {
      const t = i / TRAIL_LENGTH;
      graphics.fillStyle(color, 0.5 - t * 0.35);
      graphics.fillCircle(-i * 9, i * 5, 12 * (1 - t * 0.6));
    }

    graphics.fillStyle(color, 1);
    graphics.fillCircle(0, 0, 20);
  }
}
