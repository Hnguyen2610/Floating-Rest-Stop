import Phaser from 'phaser';
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
  private rubbing = false;
  private lastX = 0;
  private lastY = 0;

  private readonly handlePointerMove = (pointer: Phaser.Input.Pointer): void => {
    if (!this.rubbing) return;
    const distance = Phaser.Math.Distance.Between(this.lastX, this.lastY, pointer.worldX, pointer.worldY);
    this.lastX = pointer.worldX;
    this.lastY = pointer.worldY;
    if (distance > 1) this.onInteract({ type: 'rub', distance });
  };

  private readonly handlePointerUp = (): void => {
    this.rubbing = false;
  };

  protected renderBody(graphics: Phaser.GameObjects.Graphics): void {
    const color = this.hexToColor(this.emotionMeta.color);
    graphics.fillStyle(color, 1);
    graphics.fillPoints(starPoints(5, 20, 42), true);
  }

  protected wireInteraction(): void {
    this.setSize(90, 90);
    this.setInteractive(new Phaser.Geom.Circle(45, 45, 45), Phaser.Geom.Circle.Contains);

    this.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.rubbing = true;
      this.lastX = pointer.worldX;
      this.lastY = pointer.worldY;
    });
    this.scene.input.on('pointermove', this.handlePointerMove);
    this.scene.input.on('pointerup', this.handlePointerUp);
    this.once(Phaser.GameObjects.Events.DESTROY, () => {
      this.scene.input.off('pointermove', this.handlePointerMove);
      this.scene.input.off('pointerup', this.handlePointerUp);
    });
  }
}
