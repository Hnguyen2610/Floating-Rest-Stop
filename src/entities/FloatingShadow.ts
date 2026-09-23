import Phaser from 'phaser';
import { SHADOW_CONFIG } from '../core/GameConfig';
import { computeShadowVisual } from './shadowMath';

const TEXTURE_KEY = 'fx-shadow';

// Ground-anchored shadow for a floating character (Cloudy/Guest). Lives
// OUTSIDE the owning entity's own Container on purpose — that container's y
// is rewritten every frame by the entity's own bob/drift math, so a shadow
// parented inside it would bob right along and never read as "cast on the
// ground below" it. Owners create one, call sync() every frame with their
// own current x and the same Math.sin(...) value driving their bob, and
// destroy() it alongside themselves.
//
// No 'fx-shadow' texture is registered yet (no asset-generation pipeline in
// this repo — real art is generated externally by the user from a prompt
// and dropped into public/assets/ later, same as platform.png/
// button_frame.png before it). Falls back to a flat soft-alpha ellipse
// until that file exists and gets preloaded under this key.
export class FloatingShadow extends Phaser.GameObjects.Container {
  private readonly visual: Phaser.GameObjects.Image | Phaser.GameObjects.Ellipse;

  constructor(scene: Phaser.Scene, x: number) {
    super(scene, x, SHADOW_CONFIG.groundY);
    scene.add.existing(this);

    this.visual = scene.textures.exists(TEXTURE_KEY)
      ? scene.add.image(0, 0, TEXTURE_KEY)
      : scene.add.ellipse(0, 0, SHADOW_CONFIG.width, SHADOW_CONFIG.height, SHADOW_CONFIG.color, 1);
    this.add(this.visual);
  }

  // x: the owning entity's current world x (tracks horizontal drift).
  // floatSin: the owning entity's current bob Math.sin(...) value, -1..1.
  sync(x: number, floatSin: number): void {
    this.x = x;
    const { scale, alpha } = computeShadowVisual(floatSin);
    this.visual.setScale(scale);
    this.visual.setAlpha(alpha);
  }
}
