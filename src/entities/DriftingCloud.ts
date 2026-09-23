import Phaser from 'phaser';
import { GAME_WIDTH, PARALLAX_CONFIG } from '../core/GameConfig';

const TEXTURE_KEY = 'bg-cloud';

export interface DriftingCloudOptions {
  y: number;
  scale: number;
  alpha: number;
  /** px/sec, always positive — every puff drifts left-to-right. */
  speed: number;
}

// One background cloud puff, drifting slowly across the sky and wrapping
// back to the left edge once it clears the right edge. Purely decorative —
// no interaction, no effect on gameplay. Renders the shared 'bg-cloud'
// texture if loaded, otherwise a soft Graphics ellipse fallback (same
// textures.exists()-gated pattern as FloatingShadow/platform before it).
export class DriftingCloud extends Phaser.GameObjects.Container {
  private readonly visual: Phaser.GameObjects.Image | Phaser.GameObjects.Ellipse;
  private readonly speed: number;

  constructor(scene: Phaser.Scene, x: number, options: DriftingCloudOptions) {
    super(scene, x, options.y);
    scene.add.existing(this);
    this.speed = options.speed;

    this.visual = scene.textures.exists(TEXTURE_KEY)
      ? scene.add.image(0, 0, TEXTURE_KEY)
      : scene.add.ellipse(0, 0, 140, 50, 0xffffff, 1);
    this.visual.setScale(options.scale);
    this.visual.setAlpha(options.alpha);
    this.add(this.visual);
  }

  update(_time: number, delta: number): void {
    this.x += (this.speed * delta) / 1000;
    if (this.x > GAME_WIDTH + PARALLAX_CONFIG.wrapMargin) {
      this.x = -PARALLAX_CONFIG.wrapMargin;
    }
  }
}
