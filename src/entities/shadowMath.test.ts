import { describe, expect, it } from 'vitest';
import { computeShadowVisual } from './shadowMath';
import { SHADOW_CONFIG } from '../core/GameConfig';

describe('computeShadowVisual', () => {
  it('returns maxScale/maxAlpha at the lowest point of the bob (floatSin = 1)', () => {
    expect(computeShadowVisual(1)).toEqual({
      scale: SHADOW_CONFIG.maxScale,
      alpha: SHADOW_CONFIG.maxAlpha,
    });
  });

  it('returns minScale/minAlpha at the highest point of the bob (floatSin = -1)', () => {
    expect(computeShadowVisual(-1)).toEqual({
      scale: SHADOW_CONFIG.minScale,
      alpha: SHADOW_CONFIG.minAlpha,
    });
  });

  it('returns the midpoint at floatSin = 0', () => {
    const result = computeShadowVisual(0);
    expect(result.scale).toBeCloseTo((SHADOW_CONFIG.minScale + SHADOW_CONFIG.maxScale) / 2);
    expect(result.alpha).toBeCloseTo((SHADOW_CONFIG.minAlpha + SHADOW_CONFIG.maxAlpha) / 2);
  });
});
