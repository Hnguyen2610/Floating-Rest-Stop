import Phaser from 'phaser';
import { GAME_WIDTH, PALETTE, BIRDS_CONFIG } from '../core/GameConfig';

const TEXTURE_KEY = 'bg-bird';

export class AmbientBirds {
  private birds: Phaser.GameObjects.Container[] = [];
  private tweens: Phaser.Tweens.Tween[] = [];

  constructor(scene: Phaser.Scene, count = BIRDS_CONFIG.count) {
    for (let i = 0; i < count; i += 1) {
      const y = Phaser.Math.Between(BIRDS_CONFIG.yRange[0], BIRDS_CONFIG.yRange[1]);
      const scale = Phaser.Math.FloatBetween(BIRDS_CONFIG.scaleRange[0], BIRDS_CONFIG.scaleRange[1]);
      const startX = Phaser.Math.Between(-100, GAME_WIDTH + 100);

      const container = scene.add.container(startX, y);
      container.setDepth(BIRDS_CONFIG.depth);
      container.setScale(scale);

      if (scene.textures.exists(TEXTURE_KEY)) {
        container.add(scene.add.image(0, 0, TEXTURE_KEY));
      } else {
        const g = scene.add.graphics();
        g.lineStyle(2, PALETTE.eyeColor, 0.6);
        g.beginPath();
        g.arc(-6, 0, 6, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(340), false);
        g.arc(6, 0, 6, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(340), false);
        g.strokePath();
        container.add(g);
      }

      const crossDuration = Phaser.Math.Between(
        BIRDS_CONFIG.crossDurationMsRange[0],
        BIRDS_CONFIG.crossDurationMsRange[1],
      );
      const flightTween = scene.tweens.add({
        targets: container,
        x: GAME_WIDTH + 100,
        duration: crossDuration,
        repeat: -1,
        ease: 'Linear',
        delay: Phaser.Math.Between(0, 3000),
      });
      const bobTween = scene.tweens.add({
        targets: container,
        y: y - BIRDS_CONFIG.bobAmplitude,
        duration: 400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      // Wing-flap illusion: a fast vertical squash-and-release layered on
      // top of the slower bob — see BIRDS_CONFIG's comment for why (no
      // sprite-sheet frames to animate between).
      const flapTween = scene.tweens.add({
        targets: container,
        scaleY: scale * BIRDS_CONFIG.flapScaleYRatio,
        duration: BIRDS_CONFIG.flapDurationMs,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      this.birds.push(container);
      this.tweens.push(flightTween, bobTween, flapTween);
    }
  }

  destroy(): void {
    this.tweens.forEach((t) => t.destroy());
    this.birds.forEach((b) => b.destroy());
    this.tweens = [];
    this.birds = [];
  }
}
