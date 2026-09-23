import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PALETTE } from '../core/GameConfig';

export class AmbientFireflies {
  private particles: Phaser.GameObjects.Arc[] = [];
  private tweens: Phaser.Tweens.Tween[] = [];

  constructor(scene: Phaser.Scene, count = 10) {
    for (let i = 0; i < count; i += 1) {
      const x = Phaser.Math.Between(40, GAME_WIDTH - 40);
      const y = Phaser.Math.Between(100, GAME_HEIGHT * 0.7);
      const dot = scene.add.circle(x, y, Phaser.Math.FloatBetween(2, 3.5), PALETTE.softYellow, 0);
      dot.setDepth(150); // Above background/platform, below UI

      const tween = scene.tweens.add({
        targets: dot,
        alpha: { from: 0, to: Phaser.Math.FloatBetween(0.4, 0.85) },
        y: y + Phaser.Math.Between(-30, 30),
        x: x + Phaser.Math.Between(-40, 40),
        duration: Phaser.Math.Between(2000, 4000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Phaser.Math.Between(0, 2000),
      });

      this.particles.push(dot);
      this.tweens.push(tween);
    }
  }

  destroy(): void {
    this.tweens.forEach((t) => t.destroy());
    this.particles.forEach((p) => p.destroy());
    this.tweens = [];
    this.particles = [];
  }
}
