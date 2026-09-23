import Phaser from 'phaser';
import { PALETTE } from '../core/GameConfig';

// Single fixed visual (no variant selection needed), same direct
// texture-check pattern as StationScene's platform/Cloudy.
const TEXTURE_KEY = 'collectible-photo-moment-icon';
const TARGET_WIDTH = 44;

export class PhotoMomentIcon extends Phaser.GameObjects.Container {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    private onCapture: () => void,
  ) {
    super(scene, x, y);
    scene.add.existing(this);

    if (scene.textures.exists(TEXTURE_KEY)) {
      const image = scene.add.image(0, 0, TEXTURE_KEY);
      image.setScale(TARGET_WIDTH / image.frame.width);
      this.add(image);
    } else {
      const lens = scene.add.graphics();
      lens.fillStyle(PALETTE.cloudWhite, 0.95);
      lens.fillCircle(0, 0, 16);
      lens.fillStyle(PALETTE.skyTop, 1);
      lens.fillCircle(0, 0, 10);
      lens.fillStyle(0xffffff, 0.8);
      lens.fillCircle(-4, -4, 3);
      this.add(lens);
    }

    this.setSize(48, 48);
    // Container hit-test coords are relative to the top-left of setSize(), not the
    // container's origin, so a centered circle must sit at (width/2, height/2).
    this.setInteractive(new Phaser.Geom.Circle(24, 24, 24), Phaser.Geom.Circle.Contains);
    this.on('pointerdown', () => this.playCapture());

    scene.tweens.add({
      targets: this,
      scale: { from: 0.9, to: 1.1 },
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private playCapture(): void {
    this.disableInteractive();

    const camera = this.scene.cameras.main;
    const flash = this.scene.add.rectangle(
      camera.width / 2,
      camera.height / 2,
      camera.width,
      camera.height,
      0xffffff,
      0,
    );
    this.scene.tweens.add({
      targets: flash,
      alpha: 0.8,
      duration: 80,
      yoyo: true,
      onComplete: () => flash.destroy(),
    });

    this.onCapture();

    this.scene.tweens.add({
      targets: this,
      scale: 0,
      alpha: 0,
      duration: 200,
      onComplete: () => this.destroy(),
    });
  }
}
