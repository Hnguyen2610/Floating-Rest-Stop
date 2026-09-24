import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../core/GameConfig';

/**
 * One-shot particle bursts for interaction feedback. `scene.add.particles()`
 * returns the emitter directly in Phaser 3.60+ (no separate
 * `.createEmitter()` step, which only exists on the older 3.55-and-earlier
 * API) — `emitting: false` keeps it from auto-emitting continuously, so
 * `.explode()` is the only thing that fires particles.
 */

// Deliberately more saturated than PALETTE's pastel UI tokens. Confirmed by
// direct test (a stark-magenta/oversized diagnostic burst rendered clearly,
// proving the emitter itself was never the problem): the first version of
// createWeatherEffect tinted particles with PALETTE.skyTop/lavender/mint at
// small scale, and every one of them was genuinely invisible — those pastel
// tones sit too close to the sky gradient's own colors to read as a burst
// against it. VFX needs more punch than UI chrome; these constants exist
// so that gap doesn't quietly reopen the next time someone reaches for
// PALETTE out of habit.
const VFX_TINT = {
  waterBlue: 0x4fa8d8,
  moonPurple: 0x9b7fd4,
  leafGreen: 0x6fcf97,
  emberOrange: 0xffa94d,
} as const;

// Screen-wash tint per recipe, reusing VFX_TINT so the full-screen flash
// matches each effect's particle color exactly. Aurora's particles use two
// overlapping tints (purple + green) — the wash picks moonPurple alone
// rather than trying to blend both, since a two-color full-screen wash
// would read as muddy rather than as two distinct hues.
const WASH_TINT: Record<string, number> = {
  drizzle: VFX_TINT.waterBlue,
  starlight: VFX_TINT.moonPurple,
  breeze: VFX_TINT.leafGreen,
  aurora: VFX_TINT.moonPurple,
  comet: VFX_TINT.emberOrange,
};

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

  /**
   * One distinct flourish per weather recipe (RecipeDefinition.visualEffect,
   * previously unused — every recipe played the exact same generic sparkle).
   * All 5 reuse the same 'sparkle' star texture — no new art — and are
   * told apart purely by motion/color/blend, matching "Subtle > Flashy":
   * a beat longer than the plain sparkle, but still a quick one-shot burst,
   * not a sustained screen effect.
   */
  static createWeatherEffect(scene: Phaser.Scene, x: number, y: number, visualEffect: string): void {
    switch (visualEffect) {
      case 'drizzle':
        this.createDrizzleEffect(scene, x, y);
        return;
      case 'starlight':
        this.createStarlightEffect(scene, x, y);
        return;
      case 'breeze':
        this.createBreezeEffect(scene, x, y);
        return;
      case 'aurora':
        this.createAuroraEffect(scene, x, y);
        return;
      case 'comet':
        this.createCometEffect(scene, x, y);
        return;
      case 'meteor':
        this.createCometEffect(scene, x, y);
        return;
      default:
        this.createSparkleEffect(scene, x, y);
    }
  }

  /**
   * Brief full-screen color wash synced to a successful recipe delivery —
   * called alongside createWeatherEffect (same visualEffect string), not
   * merged into it, since this needs no x/y. Unknown visualEffect values
   * get no wash at all (createWeatherEffect already has its own generic
   * sparkle fallback for that case; a full-screen flash isn't worth
   * guessing a color for an effect this method doesn't recognize).
   */
  static createScreenWash(scene: Phaser.Scene, visualEffect: string): void {
    const color = WASH_TINT[visualEffect];
    if (color === undefined) return;

    const wash = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, color, 0);
    // Depth 400: above every default-depth (0) game-world object — sky,
    // platform, Cloudy, guests, particles — but below every UI panel/button,
    // which all sit at 500+ (see PanelBackground/RecipeBookUI/WelcomeGuideUI
    // etc.) — the wash tints the "world" without dimming any UI chrome.
    wash.setDepth(400);
    scene.tweens.chain({
      targets: wash,
      tweens: [
        { alpha: 0.12, duration: 150, ease: 'Sine.easeOut' },
        { alpha: 0, duration: 350, ease: 'Sine.easeIn' },
      ],
      onComplete: () => wash.destroy(),
    });
  }


  // Cool Drizzle (Sun) — small droplets raining straight down from just
  // above the guest, the only one of the 5 with real gravity: everything
  // else floats, this one visibly falls.
  private static createDrizzleEffect(scene: Phaser.Scene, x: number, y: number): void {
    const emitter = scene.add.particles(x, y - 30, 'sparkle', {
      lifespan: 700,
      speed: { min: 10, max: 20 },
      angle: { min: 80, max: 100 },
      gravityY: 160,
      tint: VFX_TINT.waterBlue,
      blendMode: Phaser.BlendModes.NORMAL,
      scale: { start: 0.7, end: 0.2 },
      alpha: { start: 0.95, end: 0 },
      emitting: false,
    });
    emitter.explode(8);
    scene.time.delayedCall(900, () => emitter.destroy());
  }

  // Starry Lullaby (Moon) — dust drifting slowly upward, longer and gentler
  // than the plain sparkle to read as "dreamy" rather than "quick".
  private static createStarlightEffect(scene: Phaser.Scene, x: number, y: number): void {
    const emitter = scene.add.particles(x, y, 'sparkle', {
      lifespan: 1400,
      speed: { min: 8, max: 18 },
      angle: { min: 250, max: 290 },
      gravityY: -20,
      tint: VFX_TINT.moonPurple,
      blendMode: Phaser.BlendModes.NORMAL,
      scale: { start: 0.75, end: 0 },
      alpha: { start: 0.95, end: 0 },
      emitting: false,
    });
    emitter.explode(9);
    scene.time.delayedCall(1600, () => emitter.destroy());
  }

  // Gentle Breeze (Butterfly) — a horizontal gust of particles sweeping
  // sideways past the guest, rather than radiating outward like the others.
  private static createBreezeEffect(scene: Phaser.Scene, x: number, y: number): void {
    const emitter = scene.add.particles(x - 30, y, 'sparkle', {
      lifespan: 650,
      speed: { min: 60, max: 100 },
      angle: { min: -12, max: 12 },
      gravityY: 0,
      tint: VFX_TINT.leafGreen,
      blendMode: Phaser.BlendModes.NORMAL,
      scale: { start: 0.65, end: 0.15 },
      alpha: { start: 0.9, end: 0 },
      emitting: false,
    });
    emitter.explode(7);
    scene.time.delayedCall(800, () => emitter.destroy());
  }

  // Aurora Veil (Aurora) — a wide arc, two overlapping tints instead of one
  // color, wider spread than any other effect to read as a "veil" sweeping
  // across rather than a burst.
  private static createAuroraEffect(scene: Phaser.Scene, x: number, y: number): void {
    const shared: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig = {
      lifespan: 1000,
      speed: { min: 20, max: 50 },
      angle: { min: 200, max: 340 },
      gravityY: -10,
      blendMode: Phaser.BlendModes.NORMAL,
      scale: { start: 0.75, end: 0 },
      alpha: { start: 0.9, end: 0 },
      emitting: false,
    };
    const purple = scene.add.particles(x, y, 'sparkle', { ...shared, tint: VFX_TINT.moonPurple });
    const green = scene.add.particles(x, y, 'sparkle', { ...shared, tint: VFX_TINT.leafGreen });
    purple.explode(6);
    green.explode(6);
    scene.time.delayedCall(1200, () => {
      purple.destroy();
      green.destroy();
    });
  }

  // Comet Trail (Comet) — a fast directional streak (high speed, short
  // lifespan) rather than a gentle drift, the only effect with a warm tint
  // and an additive glow (a burning trail, not just floating dust).
  private static createCometEffect(scene: Phaser.Scene, x: number, y: number): void {
    const emitter = scene.add.particles(x, y, 'sparkle', {
      lifespan: 450,
      speed: { min: 90, max: 140 },
      angle: { min: 160, max: 200 },
      gravityY: 0,
      tint: VFX_TINT.emberOrange,
      blendMode: Phaser.BlendModes.ADD,
      scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0 },
      emitting: false,
    });
    emitter.explode(10);
    scene.time.delayedCall(650, () => emitter.destroy());
  }
}
