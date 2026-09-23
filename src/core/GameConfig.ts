import type { SoftBodyConfig } from '../utils/SoftBodyMesh';

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

// Phaser.Scale.ENVELOP fills the viewport and crops whichever axis overflows
// on any aspect ratio other than exactly 16:9 (see docs/superpowers/specs/
// 2026-09-18-fullscreen-responsive-design.md) — every interactive control
// needs its hit area at least this far from any canvas edge to survive that
// crop across the target device ratio range ([1.5, 2.2]).
export const SAFE_ZONE_MARGIN = 80;

// Day/night now follows the player's real-world clock (replaces the earlier
// manual ☀️/🌙 toggle, per explicit user request) — simple fixed sunrise/
// sunset hours rather than actual geolocated sunrise/sunset, which would be
// far more precise than this cozy game needs.
export const DAY_START_HOUR = 6;
export const NIGHT_START_HOUR = 18;

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
  driftAmplitude: 18,
  driftFrequency: 0.35,
  blinkMinDelay: 2000,
  blinkMaxDelay: 5000,
} as const;

export const GUEST_IDLE_CONFIG = {
  floatAmplitude: 6,
  floatFrequency: 1.4,
  driftAmplitude: 14,
  driftFrequency: 0.3,
} as const;

// Ground plane every floating character's shadow anchors to. StationScene's
// drawPlatform() draws the platform as an ellipse centered at
// GAME_HEIGHT*0.72 with height 140 — its top surface sits ~70px above that
// center, so 60px is a slight sink into the surface (looks "cast onto it"
// rather than floating just above the edge). Tune by eye against a
// screenshot if it looks detached from the platform art. Shared by Cloudy
// and every Guest — same visual footprint, no need for per-type values.
export const SHADOW_CONFIG = {
  groundY: Math.round(GAME_HEIGHT * 0.72 - 60),
  width: 90,
  height: 26,
  minScale: 0.6,
  maxScale: 1,
  // Real-browser check (Playwright) showed the original 0.14-0.3 range
  // nearly disappearing against the platform's mid-tone green — bumped both
  // ends darker so the shadow stays legible on every guest, not just Cloudy
  // (which sits closer to the ground and read fine at the old values).
  minAlpha: 0.22,
  maxAlpha: 0.45,
  color: 0x3d2c4a,
} as const;

// Background cloud drift ("parallax" without a camera — this game's camera
// never pans, so depth comes from two independently-drifting puff layers
// instead). Far layer: smaller, dimmer, slower. Near layer: bigger,
// brighter, faster. Both drift left-to-right and wrap back to the left
// edge once fully off-screen (see DriftingCloud.update()).
export const PARALLAX_CONFIG = {
  // farCloud's yRange floor was 100 originally — a real-browser check (the
  // resized 260px 'bg-cloud' art is taller relative to its width than the
  // procedural fallback ellipse it was first tuned against) showed puffs at
  // the low end of that range visibly clipping the title text, which sits
  // at SAFE_ZONE_MARGIN (80) with its own ~20px height. Raised to 135 so a
  // puff's top edge (up to ~27px above its own center at max scale) clears
  // the text's ~100px bottom edge with margin.
  farCloud: { count: 3, yRange: [135, 180] as const, scaleRange: [0.35, 0.5] as const, alphaRange: [0.35, 0.5] as const, speed: 6 },
  nearCloud: { count: 2, yRange: [195, 250] as const, scaleRange: [0.55, 0.75] as const, alphaRange: [0.5, 0.7] as const, speed: 14 },
  wrapMargin: 120,
} as const;

// Phaser 3.90 built-in FX pipeline tuning. Vignette is camera-wide (cheap,
// single shader pass, darkens screen edges for mood). Bloom is scoped to
// just Cloudy's sprite (see Cloudy.ts) rather than the whole camera —
// camera-wide bloom would also glow every UI label/icon and hurt
// readability, and bloom is multi-pass (more expensive) so keeping it on
// one small object bounds the cost. Both require WebGL — see the
// `game.renderer.type === Phaser.WEBGL` guards at each call site.
//
// Vignette radius/strength are unintuitive and were both wrong on the first
// pass (verify-by-real-browser caught this, not code review): radius: 0.5,
// strength: 0.5 (values pulled straight from Phaser's own doc defaults)
// washed out the ENTIRE screen — including HUD text/icons — rather than
// just darkening the corners; radius: 0.8, strength: 0.35 (the original
// guess) turned out imperceptible, confirmed via pixel sampling (corner and
// center pixels were within 1 unit of each other). radius: 0.75/strength:
// 0.2 is the tuned result: corners read a few RGB units darker than center
// at the same sky-gradient height, with the HUD staying fully legible.
export const POST_FX_CONFIG = {
  vignette: { x: 0.5, y: 0.5, radius: 0.75, strength: 0.2 },
  cloudyBloom: { color: 0xffffff, offsetX: 0, offsetY: 0, blurStrength: 1, strength: 0.6, steps: 4 },
} as const;



