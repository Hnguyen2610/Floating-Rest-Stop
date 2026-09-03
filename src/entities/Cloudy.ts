import Phaser from 'phaser';
import { SoftBodyMesh, type Point } from '../utils/SoftBodyMesh';
import { createCloudyShapePoints } from './CloudyShapes';
import { CLOUDY_CONFIG, SOFT_BODY_CONFIG, PALETTE } from '../core/GameConfig';

export class Cloudy extends Phaser.GameObjects.Container {
  private mesh: SoftBodyMesh;
  private readonly blobGraphics: Phaser.GameObjects.Graphics;
  private readonly accessoryGraphics: Phaser.GameObjects.Graphics;
  private readonly leftEye: Phaser.GameObjects.Ellipse;
  private readonly rightEye: Phaser.GameObjects.Ellipse;
  private readonly baseX: number;
  private readonly baseY: number;
  private idleTime = 0;
  private isDragging = false;
  private hitRadius = 70;
  private accessories: string[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number, shapeId = 'default') {
    super(scene, x, y);
    this.baseX = x;
    this.baseY = y;
    scene.add.existing(this);

    this.mesh = new SoftBodyMesh(createCloudyShapePoints(shapeId), SOFT_BODY_CONFIG);

    this.blobGraphics = scene.add.graphics();
    this.accessoryGraphics = scene.add.graphics();
    this.leftEye = scene.add.ellipse(-22, -8, 10, 14, PALETTE.eyeColor);
    this.rightEye = scene.add.ellipse(22, -8, 10, 14, PALETTE.eyeColor);
    this.add([this.blobGraphics, this.accessoryGraphics, this.leftEye, this.rightEye]);

    this.updateHitArea();
    this.wireInput();
    this.scheduleNextBlink();
    this.redraw();
  }

  update(_time: number, delta: number): void {
    const dt = delta / 1000;
    this.idleTime += dt;
    this.y =
      this.baseY + Math.sin(this.idleTime * CLOUDY_CONFIG.floatFrequency) * CLOUDY_CONFIG.floatAmplitude;
    this.x =
      this.baseX + Math.sin(this.idleTime * CLOUDY_CONFIG.driftFrequency) * CLOUDY_CONFIG.driftAmplitude;

    this.mesh.update(dt);
    this.redraw();
  }

  playHappyBounce(): void {
    this.scene.tweens.chain({
      targets: this,
      tweens: [
        { scaleX: 1.15, scaleY: 0.85, duration: 90, ease: 'Sine.easeOut' },
        { scaleX: 0.9, scaleY: 1.2, duration: 140, ease: 'Sine.easeInOut' },
        { scaleX: 1, scaleY: 1, duration: 260, ease: 'Elastic.easeOut' },
      ],
    });
  }

  // Cosmetics (Pass 23): swapping shape rebuilds the same SoftBodyMesh with
  // different home-point geometry — no new physics, no new interaction code.
  setShape(shapeId: string): void {
    this.mesh = new SoftBodyMesh(createCloudyShapePoints(shapeId), SOFT_BODY_CONFIG);
    this.updateHitArea();
    this.redraw();
  }

  setAccessories(accessoryIds: string[]): void {
    this.accessories = accessoryIds;
    this.redraw();
  }

  private updateHitArea(): void {
    const points = this.mesh.getPoints();
    this.hitRadius = Math.max(...points.map((p) => Math.hypot(p.x, p.y)), 40);
    this.setSize(this.hitRadius * 2, this.hitRadius * 2);
    // Container hit-test coords are relative to the top-left of setSize(), not the
    // container's origin, so a centered circle must sit at (width/2, height/2).
    this.setInteractive(
      new Phaser.Geom.Circle(this.hitRadius, this.hitRadius, this.hitRadius),
      Phaser.Geom.Circle.Contains,
    );
  }

  private wireInput(): void {
    this.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.isDragging = true;
      this.playTouchReaction();
      this.mesh.applyPointerInfluence(this.toLocalPoint(pointer));
    });

    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.isDragging) return;
      this.mesh.applyPointerInfluence(this.toLocalPoint(pointer));
    });

    this.scene.input.on('pointerup', () => this.endDrag());
    this.scene.input.on('pointerupoutside', () => this.endDrag());
  }

  private endDrag(): void {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.mesh.release();
  }

  private toLocalPoint(pointer: Phaser.Input.Pointer): Point {
    return {
      x: (pointer.worldX - this.x) / this.scaleX,
      y: (pointer.worldY - this.y) / this.scaleY,
    };
  }

  private playTouchReaction(): void {
    this.scene.tweens.add({
      targets: this,
      scaleX: 0.94,
      scaleY: 0.94,
      duration: 70,
      yoyo: true,
      ease: 'Sine.easeOut',
    });
  }

  private scheduleNextBlink(): void {
    const delay = Phaser.Math.Between(CLOUDY_CONFIG.blinkMinDelay, CLOUDY_CONFIG.blinkMaxDelay);
    this.scene.time.delayedCall(delay, () => {
      this.playBlink();
      this.scheduleNextBlink();
    });
  }

  private playBlink(): void {
    this.scene.tweens.add({
      targets: [this.leftEye, this.rightEye],
      scaleY: 0.1,
      duration: 70,
      yoyo: true,
      ease: 'Sine.easeInOut',
    });
  }

  private redraw(): void {
    const points = this.mesh.getPoints();
    this.blobGraphics.clear();
    this.blobGraphics.fillStyle(PALETTE.cloudWhite, 1);
    this.blobGraphics.fillPoints(points, true);

    this.accessoryGraphics.clear();
    this.accessories.forEach((id) => this.drawAccessory(id));
  }

  private drawAccessory(id: string): void {
    const g = this.accessoryGraphics;
    switch (id) {
      case 'sunset_hat':
        g.fillStyle(0xf6bd60, 1);
        g.beginPath();
        g.moveTo(-20, -68);
        g.lineTo(20, -68);
        g.lineTo(0, -100);
        g.closePath();
        g.fillPath();
        g.fillStyle(PALETTE.eyeColor, 0.5);
        g.fillRect(-22, -68, 44, 6);
        break;
      case 'star_clip':
        g.fillStyle(0xfdf2a4, 1);
        this.drawStar(g, 34, -30, 5, 10, 5);
        break;
      case 'rainbow_ribbon': {
        const colors = [0xf28b82, 0xf6bd60, 0xbfe3d0, 0xa9d8f0, 0xd9c9ec];
        colors.forEach((color, i) => {
          g.fillStyle(color, 0.9);
          g.fillTriangle(-16 + i * 2, 30, 0, 44, -16 + i * 2 + 10, 30);
        });
        g.fillStyle(PALETTE.eyeColor, 0.6);
        g.fillCircle(-6, 30, 4);
        break;
      }
    }
  }

  private drawStar(
    g: Phaser.GameObjects.Graphics,
    cx: number,
    cy: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number,
  ): void {
    const step = Math.PI / spikes;
    g.beginPath();
    for (let i = 0; i < spikes * 2; i += 1) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = i * step - Math.PI / 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.closePath();
    g.fillPath();
  }
}
