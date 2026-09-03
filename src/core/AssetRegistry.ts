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

const REGISTERED_ASSETS: Record<string, AssetEntry> = {};

/** e.g. 'SUN_STRESSED' -> 'guest.sun.stressed', 'MOON_LONELY' -> 'guest.moon.lonely' */
export function emotionIdToAssetKey(emotionId: string): string {
  const [prefix, ...rest] = emotionId.split('_');
  return `guest.${prefix.toLowerCase()}.${rest.join('_').toLowerCase()}`;
}

/** e.g. 'wind_chime' -> 'decoration.wind_chime' */
export function decorationIdToAssetKey(decorationId: string): string {
  return `decoration.${decorationId}`;
}

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

export function resolveDecorationAsset(decorationId: string): AssetEntry {
  return resolveAsset(decorationIdToAssetKey(decorationId));
}

/** True once a real texture is both registered here and actually preloaded into the scene. */
export function hasLoadedTexture(scene: Phaser.Scene, entry: AssetEntry): boolean {
  return Boolean(entry.texturePath) && scene.textures.exists(entry.key);
}
