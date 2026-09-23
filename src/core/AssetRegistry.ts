import type Phaser from 'phaser';

/**
 * Presentation-layer asset lookup (Pass 26). Gameplay logic (EmotionSystem,
 * GuestSystem, DecorationSystem, ...) only ever knows abstract state — an
 * emotion id like 'SUN_STRESSED', a decoration id like 'wind_chime'. It never
 * sees a filename. Only the rendering layer (Guest, Decoration) consults this
 * registry, and only to decide "do I have a real texture, or do I fall back
 * to the procedural Graphics placeholder?"
 *
 * Today REGISTERED_ASSETS is empty, so every lookup falls back to procedural
 * rendering — that's the whole placeholder art strategy already in use
 * everywhere else in this codebase. Swapping in real art later means: drop
 * the file in public/assets, add one entry here, preload it under the same
 * key in PreloadScene — no change needed in EmotionSystem, GuestSystem,
 * DecorationSystem, or any call site that renders through this registry.
 */
export interface AssetEntry {
  key: string;
  texturePath?: string;
}

/** e.g. 'SUN_STRESSED' -> 'guest.sun.stressed', 'MOON_LONELY' -> 'guest.moon.lonely' */
export function emotionIdToAssetKey(emotionId: string): string {
  const [prefix, ...rest] = emotionId.split('_');
  return `guest.${prefix.toLowerCase()}.${rest.join('_').toLowerCase()}`;
}

// Illustrated guest art (post-release-prep pass): 5 stage images per guest,
// covering the full shared DISTRESSED→CALMING→RELAXED→CONTENT→PEACEFUL
// progression (same order GuestSystem's STAGE_EMOTION_BY_GUEST maps each
// guest's own emotion ids onto). `emotionIdToAssetKey` derives its key
// prefix from the emotion id's own text, which for Little Star is "star"
// (from STAR_*) rather than the guest id "little_star" — that's fine, the
// folder path below doesn't need to match the key string, only this table
// and PreloadScene's preload (via getAllRegisteredAssets()) need to agree.
const GUEST_EMOTION_STAGES: Record<string, { folder: string; emotionIds: readonly [string, string, string, string, string] }> = {
  sun: { folder: 'sun', emotionIds: ['SUN_OVERHEATED', 'SUN_STRESSED', 'SUN_UNEASY', 'SUN_CALMING', 'SUN_RELAXED'] },
  moon: { folder: 'moon', emotionIds: ['MOON_LONELY', 'MOON_DISTANT', 'MOON_OPENING', 'MOON_SHARING', 'MOON_PEACEFUL'] },
  little_star: {
    folder: 'little_star',
    emotionIds: ['STAR_INSECURE', 'STAR_HESITANT', 'STAR_TRYING', 'STAR_BELIEVING', 'STAR_CONFIDENT'],
  },
  butterfly: {
    folder: 'butterfly',
    emotionIds: ['BUTTERFLY_WET', 'BUTTERFLY_RESTING', 'BUTTERFLY_DRYING', 'BUTTERFLY_CHATTING', 'BUTTERFLY_HAPPY'],
  },
  aurora: {
    folder: 'aurora',
    emotionIds: ['AURORA_DIM', 'AURORA_FLICKERING', 'AURORA_GLOWING', 'AURORA_SHIMMERING', 'AURORA_RADIANT'],
  },
  comet: {
    folder: 'comet',
    emotionIds: ['COMET_FADING', 'COMET_STIRRING', 'COMET_STREAKING', 'COMET_BLAZING', 'COMET_BRILLIANT'],
  },
};
const STAGE_FILENAMES = ['distressed', 'calming', 'relaxed', 'content', 'peaceful'] as const;

const REGISTERED_ASSETS: Record<string, AssetEntry> = {};
Object.values(GUEST_EMOTION_STAGES).forEach(({ folder, emotionIds }) => {
  emotionIds.forEach((emotionId, i) => {
    const key = emotionIdToAssetKey(emotionId);
    REGISTERED_ASSETS[key] = { key, texturePath: `assets/guests/${folder}/${STAGE_FILENAMES[i]}.png` };
  });
});

/** Every registered asset with a real texture — PreloadScene iterates this instead of a second hardcoded list. */
export function getAllRegisteredAssets(): AssetEntry[] {
  return Object.values(REGISTERED_ASSETS);
}

/** e.g. 'wind_chime' -> 'decoration.wind_chime' */
export function decorationIdToAssetKey(decorationId: string): string {
  return `decoration.${decorationId}`;
}

// Illustrated decoration art (visual-upgrade pass after guest/Cloudy/platform
// art). Filenames differ from decoration ids only for firefly_lantern, which
// has separate day/night art — every other decoration has one image shared
// across day and night, matching the user's explicit scope choice (only the
// lantern got a night variant, not all 5 decorations).
const DECORATION_FILES: Record<string, string> = {
  wind_chime: 'wind_chime',
  rainbow_hammock: 'rainbow_hammock',
  tea_table: 'tea_table',
  wind_pinwheel: 'wind_pinwheel',
  firefly_lantern: 'firefly_lantern_day',
};
Object.entries(DECORATION_FILES).forEach(([id, filename]) => {
  const key = decorationIdToAssetKey(id);
  REGISTERED_ASSETS[key] = { key, texturePath: `assets/decorations/${filename}.png` };
});
const FIREFLY_LANTERN_NIGHT_KEY = `${decorationIdToAssetKey('firefly_lantern')}.night`;
REGISTERED_ASSETS[FIREFLY_LANTERN_NIGHT_KEY] = {
  key: FIREFLY_LANTERN_NIGHT_KEY,
  texturePath: 'assets/decorations/firefly_lantern_night.png',
};

/**
 * e.g. 'heart' -> 'cloudy.heart' (naming only, dot-separated to match this
 * registry's other keys). Cloudy.ts now renders real illustrated sprites
 * (post-Pass-31 art pass), but resolves its own `cloudy-<shape>-<expression>`
 * texture keys directly rather than through this registry — Cloudy always
 * has art for every shape it can be (with an idle-only fallback for shapes
 * missing full expression coverage), so there's no procedural-vs-texture
 * branch left to decide here the way Guest/Decoration still have.
 */
export function cloudyShapeIdToAssetKey(shapeId: string): string {
  return `cloudy.${shapeId}`;
}

export function resolveAsset(key: string): AssetEntry {
  return REGISTERED_ASSETS[key] ?? { key };
}

export function resolveEmotionAsset(emotionId: string): AssetEntry {
  return resolveAsset(emotionIdToAssetKey(emotionId));
}

// isNight tries "<id>.night" first (only firefly_lantern has one today) and
// falls back to the regular day/shared key — same fallback shape as
// hasLoadedTexture's "no art yet -> procedural" branch one level up.
export function resolveDecorationAsset(decorationId: string, isNight = false): AssetEntry {
  const dayKey = decorationIdToAssetKey(decorationId);
  if (isNight) {
    const nightKey = `${dayKey}.night`;
    if (REGISTERED_ASSETS[nightKey]) return REGISTERED_ASSETS[nightKey];
  }
  return resolveAsset(dayKey);
}

/** True once a real texture is both registered here and actually preloaded into the scene. */
export function hasLoadedTexture(scene: Phaser.Scene, entry: AssetEntry): boolean {
  return Boolean(entry.texturePath) && scene.textures.exists(entry.key);
}
