import Phaser from 'phaser';
import { FONT_FAMILY } from '../core/GameConfig';

const TEXTURE_KEY = 'button-frame';
// Small on purpose (unlike PanelBackground's 36) — this same texture is
// reused at every scale from a 28px close-button square up to a 130px-tall
// Journal memory card, and a large corner would visibly overlap itself on
// the smallest of those. Re-measure if the source art changes.
const CORNER_SIZE = 14;

/**
 * Shared background swap point for every "chip"-shaped interactive element
 * in the game — action buttons, the close ✕, shop purchase rows, Journal
 * chapter/memory cards. All of it used to be its own flat `scene.add.
 * rectangle()` or a Text's CSS-like `backgroundColor` (hard corners, no
 * illustrated material) styled independently per call site. Same
 * presentation-layer pattern as PanelBackground: NineSlice once
 * 'button-frame' art is registered, a flat rectangle fallback until then.
 */
export type ButtonBackground = Phaser.GameObjects.GameObject &
  Phaser.GameObjects.Components.AlphaSingle &
  Phaser.GameObjects.Components.Transform;

// Rectangle (via Shape) and NineSlice both implement AlphaSingle/Transform,
// but plain GameObject doesn't — this wider return type lets callers that
// need locked/unlocked-style state (shop rows) call `.setAlpha()`/read
// `.x` on the result without a cast. Neither implementation supports
// `.setTint()`, so alpha is the only state-differentiation tool available.
export function createButtonBackground(
  scene: Phaser.Scene,
  width: number,
  height: number,
  color = 0x8b7355,
): ButtonBackground {
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
  // Every original call site this replaces had a visible border (either
  // Rectangle.setStrokeStyle or a NineSlice-shaped illustrated outline once
  // real art exists) — the fallback needs one too, confirmed by an actual
  // regression caught via Playwright: without it, Journal's memory cards
  // rendered as flat borderless blocks, losing definition against the
  // journal's own pastel background.
  return scene.add.rectangle(0, 0, width, height, color, 1).setStrokeStyle(2, 0x5b4a63, 0.3);
}

export interface ButtonOptions {
  fontSize?: string;
  /** For long labels (e.g. PaperBoatUI's acknowledge button) that need to wrap
   * instead of producing one very wide button. */
  wordWrapWidth?: number;
}

/**
 * A complete clickable text button — background sized to fit the label,
 * wired to fire onClick on pointerdown. Replaces the old
 * `scene.add.text(..., { backgroundColor: '#8b7355' })` pattern used
 * identically across WeatherMixerUI/PaperBoatUI/WelcomeGuideUI.
 *
 * For a button whose label changes after creation (PaperBoatUI's fold
 * button cycles through 4 labels), don't use this — call
 * `createButtonBackground` directly and keep your own reference to the
 * Text so you can `.setText()` it; a fixed-size container built from this
 * function's first label would either clip or leave the background
 * oddly oversized once the text changes.
 */
export function createButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onClick: () => void,
  options: ButtonOptions = {},
): Phaser.GameObjects.Container {
  const { fontSize = '12px', wordWrapWidth } = options;
  const text = scene.add
    .text(0, 0, label, {
      fontFamily: FONT_FAMILY,
      fontSize,
      color: '#ffffff',
      align: 'center',
      ...(wordWrapWidth ? { wordWrap: { width: wordWrapWidth } } : {}),
    })
    .setOrigin(0.5);

  const width = text.width + 20;
  const height = text.height + 12;
  const bg = createButtonBackground(scene, width, height);

  const container = scene.add.container(x, y, [bg, text]);
  container.setSize(width, height);
  // Container hit-test coords are relative to the top-left of setSize(), not the
  // container's origin, so a full-coverage rect matching setSize() starts at (0,0).
  container.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
  if (container.input) container.input.cursor = 'pointer';
  container.on('pointerdown', onClick);
  return container;
}

/** The small "✕" icon button every panel uses to close itself. */
export function createCloseButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  onClick: () => void,
): Phaser.GameObjects.Container {
  const size = 26;
  const bg = createButtonBackground(scene, size, size, 0xfdfbf7);
  const text = scene.add
    .text(0, 0, '✕', { fontFamily: FONT_FAMILY, fontSize: '14px', color: '#5b4a63' })
    .setOrigin(0.5);

  const container = scene.add.container(x, y, [bg, text]);
  container.setSize(size, size);
  container.setInteractive(new Phaser.Geom.Rectangle(0, 0, size, size), Phaser.Geom.Rectangle.Contains);
  if (container.input) container.input.cursor = 'pointer';
  container.on('pointerdown', onClick);
  return container;
}
