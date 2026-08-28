import Phaser from 'phaser';
import { SoftBodyMesh, type Point } from '../utils/SoftBodyMesh';
import { CLOUDY_CONFIG, SOFT_BODY_CONFIG, PALETTE } from '../core/GameConfig';

function createCloudSilhouette(
  pointCount: number,
  baseRadius: number,
  wobbleAmplitude: number,
  wobbleFrequency: number,
): Point[] {
  const points: Point[] = [];
  for (let i = 0; i < pointCount; i += 1) {
    const angle = (i / pointCount) * Math.PI * 2;
    const radius = baseRadius + wobbleAmplitude * Math.sin(angle * wobbleFrequency);
    points.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius * 0.8 });
  }
  return points;
}

export class Cloudy extends Phaser.GameObjects.Container {
  private readonly mesh: SoftBodyMesh;
  private readonly blobGraphics: Phaser.GameObjects.Graphics;
  private readonly leftEye: Phaser.GameObjects.Ellipse;
  private readonly rightEye: Phaser.GameObjects.Ellipse;
  private readonly baseY: number;
  private idleTime = 0;
  private isDragging = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.baseY = y;
    scene.add.existing(this);

    const homePoints = createCloudSilhouette(
      CLOUDY_CONFIG.pointCount,
      CLOUDY_CONFIG.baseRadius,
      CLOUDY_CONFIG.wobbleAmplitude,
      CLOUDY_CONFIG.wobbleFrequency,
    );
    this.mesh = new SoftBodyMesh(homePoints, SOFT_BODY_CONFIG);

    this.blobGraphics = scene.add.graphics();
    this.leftEye = scene.add.ellipse(-22, -8, 10, 14, PALETTE.eyeColor);
    this.rightEye = scene.add.ellipse(22, -8, 10, 14, PALETTE.eyeColor);
    this.add([this.blobGraphics, this.leftEye, this.rightEye]);

    const hitRadius = CLOUDY_CONFIG.baseRadius + CLOUDY_CONFIG.wobbleAmplitude;
    this.setSize(hitRadius * 2, hitRadius * 2);
    this.setInteractive(new Phaser.Geom.Circle(0, 0, hitRadius), Phaser.Geom.Circle.Contains);

    this.wireInput();
    this.scheduleNextBlink();
    this.redraw();
  }

  update(_time: number, delta: number): void {
    const dt = delta / 1000;
    this.idleTime += dt;
    this.y =
      this.baseY + Math.sin(this.idleTime * CLOUDY_CONFIG.floatFrequency) * CLOUDY_CONFIG.floatAmplitude;

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
  }
}
