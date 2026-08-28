import type { SoftBodyConfig } from '../utils/SoftBodyMesh';

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

// Georgia drops some Vietnamese double-diacritic glyphs (e.g. "ầ" renders as
// a bare circumflex + stray grave mark), and Canvas 2D fillText — what
// Phaser.Text draws through — doesn't fall back per-glyph across a font
// stack the way DOM text does, so listing a fallback after Georgia doesn't
// help. Serif alternatives that resolve to "Times New Roman" render fine via
// plain canvas fillText but still drop other glyphs (e.g. the hook on "ỉ")
// specifically through Phaser's text pipeline. Arial is the one font that's
// tested clean for full Vietnamese text in both paths.
export const FONT_FAMILY = 'Arial';

export const PALETTE = {
  skyTop: 0xa9d8f0,
  skyBottom: 0xfff6e5,
  cloudWhite: 0xfdfbf7,
  pastelPink: 0xf7c9d0,
  lavender: 0xd9c9ec,
  mint: 0xc8ede0,
  softYellow: 0xfdf2a4,
  eyeColor: 0x5b4a63,
} as const;

export const SOFT_BODY_CONFIG: SoftBodyConfig = {
  stiffness: 55,
  damping: 9,
  influenceRadius: 70,
  stretchLimit: 26,
  returnSpeed: 1.6,
};

export const CLOUDY_CONFIG = {
  pointCount: 28,
  baseRadius: 70,
  wobbleAmplitude: 8,
  wobbleFrequency: 4,
  floatAmplitude: 8,
  floatFrequency: 1.1,
  blinkMinDelay: 2000,
  blinkMaxDelay: 5000,
} as const;
