import { Guest } from '../entities/Guest';

// A few soft, wavy ribbon bands stacked to read as northern-lights curtains.
const BAND_COUNT = 4;

export class AuroraGuest extends Guest {
  protected renderBody(graphics: Phaser.GameObjects.Graphics): void {
    const color = this.hexToColor(this.emotionMeta.color);

    for (let band = 0; band < BAND_COUNT; band += 1) {
      const baseY = -30 + band * 18;
      graphics.fillStyle(color, 0.5 - band * 0.08);
      graphics.beginPath();
      graphics.moveTo(-45, baseY);
      for (let x = -45; x <= 45; x += 6) {
        const wave = Math.sin((x + band * 15) * 0.12) * 10;
        graphics.lineTo(x, baseY + wave);
      }
      for (let x = 45; x >= -45; x -= 6) {
        const wave = Math.sin((x + band * 15) * 0.12) * 10;
        graphics.lineTo(x, baseY + wave + 14);
      }
      graphics.closePath();
      graphics.fillPath();
    }

    graphics.fillStyle(color, 0.9);
    graphics.fillCircle(0, 20, 14);
  }
}
