import { Guest } from '../entities/Guest';

export class SunGuest extends Guest {
  protected renderBody(graphics: Phaser.GameObjects.Graphics): void {
    const color = this.hexToColor(this.emotionMeta.color);
    const radius = 42;
    const rayCount = 10;

    graphics.fillStyle(color, 0.85);
    for (let i = 0; i < rayCount; i += 1) {
      const angle = (i / rayCount) * Math.PI * 2;
      const innerR = radius + 6;
      const outerR = radius + 18;
      const spread = 0.18;
      graphics.beginPath();
      graphics.moveTo(Math.cos(angle - spread) * innerR, Math.sin(angle - spread) * innerR);
      graphics.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
      graphics.lineTo(Math.cos(angle + spread) * innerR, Math.sin(angle + spread) * innerR);
      graphics.closePath();
      graphics.fillPath();
    }

    graphics.fillStyle(color, 1);
    graphics.fillCircle(0, 0, radius);
  }
}
