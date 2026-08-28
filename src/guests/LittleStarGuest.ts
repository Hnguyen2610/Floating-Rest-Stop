import { Guest } from '../entities/Guest';
import type { Point } from '../utils/SoftBodyMesh';

function starPoints(spikes: number, innerRadius: number, outerRadius: number): Point[] {
  const points: Point[] = [];
  const step = Math.PI / spikes;
  for (let i = 0; i < spikes * 2; i += 1) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = i * step - Math.PI / 2;
    points.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
  }
  return points;
}

export class LittleStarGuest extends Guest {
  protected drawBody(): void {
    const color = this.hexToColor(this.emotionMeta.color);
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.fillPoints(starPoints(5, 20, 42), true);
    this.add(graphics);
  }
}
