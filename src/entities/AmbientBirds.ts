import Phaser from 'phaser';
import { GAME_WIDTH, PALETTE, BIRDS_CONFIG } from '../core/GameConfig';

// 3 real flap poses (wings up / mid / down), swapped by texture like
// Cloudy's expression poses (see Cloudy.showExpression()) — a whole-bird
// scaleY squash was tried first and looked wrong (the body visibly
// "folded" along with the wings instead of just the wings moving), so this
// needs actual alternate-pose art, not a fake-out from one static image.
const FRAME_KEYS = ['bg-bird-up', 'bg-bird-mid', 'bg-bird-down'];
// up -> mid -> down -> mid -> (loops back to up) for a symmetric flap.
const FLAP_SEQUENCE = [0, 1, 2, 1];

export class AmbientBirds {
  private birds: Phaser.GameObjects.Container[] = [];
  private tweens: Phaser.Tweens.Tween[] = [];
  private timers: Phaser.Time.TimerEvent[] = [];

  constructor(scene: Phaser.Scene, count = BIRDS_CONFIG.count) {
    for (let i = 0; i < count; i += 1) {
      const y = Phaser.Math.Between(BIRDS_CONFIG.yRange[0], BIRDS_CONFIG.yRange[1]);
      const scale = Phaser.Math.FloatBetween(BIRDS_CONFIG.scaleRange[0], BIRDS_CONFIG.scaleRange[1]);
      const startX = Phaser.Math.Between(-100, GAME_WIDTH + 100);

      const container = scene.add.container(startX, y);
      container.setDepth(BIRDS_CONFIG.depth);
      container.setScale(scale);

      if (scene.textures.exists(FRAME_KEYS[0])) {
        const image = scene.add.image(0, 0, FRAME_KEYS[0]);
        container.add(image);

        let frameIndex = 0;
        const flapTimer = scene.time.addEvent({
          delay: BIRDS_CONFIG.flapDurationMs,
          loop: true,
          callback: () => {
            frameIndex = (frameIndex + 1) % FLAP_SEQUENCE.length;
            image.setTexture(FRAME_KEYS[FLAP_SEQUENCE[frameIndex]]);
          },
        });
        this.timers.push(flapTimer);
      } else {
        // No real art loaded yet — a plain static silhouette (no fake flap
        // from a single pose; see the note above on why that looked bad).
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

      this.birds.push(container);
      this.tweens.push(flightTween, bobTween);
    }
  }

  destroy(): void {
    this.tweens.forEach((t) => t.destroy());
    this.timers.forEach((t) => t.destroy());
    this.birds.forEach((b) => b.destroy());
    this.tweens = [];
    this.timers = [];
    this.birds = [];
  }
}
