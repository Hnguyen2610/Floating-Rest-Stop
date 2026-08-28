import { Guest } from '../entities/Guest';
import { PALETTE } from '../core/GameConfig';

export class MoonGuest extends Guest {
  protected drawBody(): void {
    const color = this.hexToColor(this.emotionMeta.color);
    const graphics = this.scene.add.graphics();
    const radius = 40;

    graphics.fillStyle(color, 1);
    graphics.fillCircle(0, 0, radius);
    graphics.fillStyle(PALETTE.skyTop, 1);
    graphics.fillCircle(16, -6, radius * 0.85);
    this.add(graphics);
  }
}
