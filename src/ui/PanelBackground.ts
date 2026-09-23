import Phaser from 'phaser';
import { PALETTE } from '../core/GameConfig';

const TEXTURE_KEY = 'panel-frame';
// Measured directly off the actual 300x300 processed source (public/assets/
// ui/panel_frame.png) — the rounded-corner curve finishes by y≈30 (scanned
// pixel-by-pixel, not eyeballed), +6px buffer for the border's own thickness
// and antialiasing. Re-measure this if the source art is ever regenerated.
const CORNER_SIZE = 36;

/**
 * Shared panel-backdrop swap point (same presentation-layer pattern as every
 * other procedural->illustrated pass this project has done — Guest,
 * Decoration, Cloudy, the platform). Every shop/dialog panel in the game
 * used to draw its own flat `scene.add.rectangle()` backdrop independently;
 * this is the single place that decides "real illustrated frame, or the
 * procedural placeholder" for all of them.
 *
 * Once a 'panel-frame' texture is registered, this returns a NineSlice:
 * Phaser keeps the CORNER_SIZE region of the source texture unstretched
 * (rounded corners, border thickness) while the edges/center stretch to
 * fit whatever width/height each caller passes — one texture serves every
 * panel size in the game, no per-panel art needed.
 */
export function createPanelBackground(
  scene: Phaser.Scene,
  width: number,
  height: number,
): Phaser.GameObjects.GameObject {
  if (scene.textures.exists(TEXTURE_KEY)) {
    return scene.add.nineslice(
      0,
      0,
      TEXTURE_KEY,
      undefined,
      width,
      height,
      CORNER_SIZE,
      CORNER_SIZE,
      CORNER_SIZE,
      CORNER_SIZE,
    );
  }

  return scene.add
    .rectangle(0, 0, width, height, PALETTE.cloudWhite, 0.95)
    .setStrokeStyle(1, PALETTE.eyeColor, 0.25);
}
