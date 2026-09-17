import Phaser from 'phaser';

/**
 * One-shot particle bursts for interaction feedback. `scene.add.particles()`
 * returns the emitter directly in Phaser 3.60+ (no separate
 * `.createEmitter()` step, which only exists on the older 3.55-and-earlier
 * API) — `emitting: false` keeps it from auto-emitting continuously, so
 * `.explode()` is the only thing that fires particles.
 */
export class ParticleEffect {
  static createSparkleEffect(scene: Phaser.Scene, x: number, y: number): void {
    const emitter = scene.add.particles(x, y, 'sparkle', {
      lifespan: 800,
      speed: { min: 20, max: 40 },
      blendMode: Phaser.BlendModes.NORMAL,
      gravityY: 0,
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.8, end: 0 },
      emitting: false,
    });
    emitter.explode(5);
    scene.time.delayedCall(1000, () => emitter.destroy());
  }

  /** Used for happiness crystals — softer and larger than the sparkle burst. */
  static createGlowEffect(scene: Phaser.Scene, x: number, y: number): void {
    const emitter = scene.add.particles(x, y, 'sparkle', {
      lifespan: 600,
      speed: { min: 10, max: 30 },
      blendMode: Phaser.BlendModes.SCREEN,
      gravityY: 0,
      scale: { start: 0.7, end: 0 },
      alpha: { start: 0.6, end: 0 },
      emitting: false,
    });
    emitter.explode(3);
    scene.time.delayedCall(800, () => emitter.destroy());
  }
}
