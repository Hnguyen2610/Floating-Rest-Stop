import { SHADOW_CONFIG } from '../core/GameConfig';

export interface ShadowVisual {
  scale: number;
  alpha: number;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// floatSin is the exact Math.sin(...) value the owning entity (Cloudy/Guest)
// already computes to offset its own y each frame — range -1..1. +1 is the
// bob's lowest point (closest to the ground plane, so the shadow reads
// largest/clearest); -1 is the bob's highest point (shadow shrinks/fades as
// if receding from the ground).
export function computeShadowVisual(floatSin: number): ShadowVisual {
  const t = (floatSin + 1) / 2;
  return {
    scale: lerp(SHADOW_CONFIG.minScale, SHADOW_CONFIG.maxScale, t),
    alpha: lerp(SHADOW_CONFIG.minAlpha, SHADOW_CONFIG.maxAlpha, t),
  };
}
