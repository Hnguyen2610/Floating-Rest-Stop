import { Guest } from '../entities/Guest';
import { PALETTE } from '../core/GameConfig';

// Butterfly is a "group" guest — rendered as a small flock of wing-pairs
// instead of one large shape, to read visually distinct from the single-body
// Sun/Moon/Star guests.
const FLOCK = [
  { x: -26, y: -8, scale: 1 },
  { x: 18, y: 6, scale: 0.85 },
  { x: -6, y: 20, scale: 0.7 },
];

export class ButterflyGuest extends Guest {
  protected renderBody(graphics: Phaser.GameObjects.Graphics): void {
    const color = this.hexToColor(this.emotionMeta.color);

    FLOCK.forEach(({ x, y, scale }) => {
      graphics.fillStyle(color, 0.9);
      graphics.fillEllipse(x - 6 * scale, y, 12 * scale, 18 * scale);
      graphics.fillEllipse(x + 6 * scale, y, 12 * scale, 18 * scale);
      graphics.fillStyle(PALETTE.eyeColor, 0.6);
      graphics.fillRect(x - 1, y - 9 * scale, 2, 18 * scale);
    });
  }
}
