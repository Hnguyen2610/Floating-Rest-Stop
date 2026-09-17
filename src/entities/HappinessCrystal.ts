import Phaser from 'phaser';
import { PALETTE } from '../core/GameConfig';
import { ParticleEffect } from '../utils/ParticleEffect';

export class HappinessCrystal extends Phaser.GameObjects.Container {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    private counterPosition: { x: number; y: number },
    private onCollect: () => void,
  ) {
    super(scene, x, y);
    scene.add.existing(this);

    const gem = scene.add.graphics();
    gem.fillStyle(PALETTE.softYellow, 1);
    gem.fillPoints(
      [
        { x: 0, y: -16 },
        { x: 11, y: -3 },
        { x: 0, y: 16 },
        { x: -11, y: -3 },
      ],
      true,
    );
    gem.fillStyle(0xffffff, 0.6);
    gem.fillPoints(
      [
        { x: 0, y: -16 },
        { x: 4, y: -6 },
        { x: 0, y: 3 },
        { x: -4, y: -6 },
      ],
      true,
    );
    this.add(gem);

    this.setSize(48, 48);
    // Container hit-test coords are relative to the top-left of setSize(), not the
    // container's origin, so a centered circle must sit at (width/2, height/2).
    this.setInteractive(new Phaser.Geom.Circle(24, 24, 24), Phaser.Geom.Circle.Contains);
    this.on('pointerdown', () => this.collect());

    this.setScale(0);
    scene.tweens.add({ targets: this, scale: 1, duration: 260, ease: 'Back.easeOut' });
    this.playSparkles();
  }

  private playSparkles(): void {
    for (let i = 0; i < 4; i += 1) {
      const angle = (i / 4) * Math.PI * 2;
      const dot = this.scene.add.circle(0, 0, 3, 0xffffff, 0.9);
      this.add(dot);
      this.scene.tweens.add({
        targets: dot,
        x: Math.cos(angle) * 26,
        y: Math.sin(angle) * 26,
        alpha: 0,
        duration: 400,
        onComplete: () => dot.destroy(),
      });
    }
  }

  private collect(): void {
    this.disableInteractive();
    ParticleEffect.createGlowEffect(this.scene, this.x, this.y);
    this.scene.tweens.add({
      targets: this,
      x: this.counterPosition.x,
      y: this.counterPosition.y,
      scale: 0.2,
      alpha: 0.6,
      duration: 350,
      ease: 'Cubic.easeIn',
      onComplete: () => {
        this.onCollect();
        this.destroy();
      },
    });
  }
}
