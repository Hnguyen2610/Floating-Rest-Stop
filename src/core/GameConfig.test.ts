import { describe, expect, it } from 'vitest';
import { BIRDS_CONFIG, DISTANT_SCENERY_CONFIG, SKY_GRADIENT_CONFIG } from './GameConfig';

describe('background ambience config', () => {
  it('defines the richer sky gradient and static scenic layers', () => {
    expect(SKY_GRADIENT_CONFIG.day.mid).toBe(0xf7c9d0);
    expect(SKY_GRADIENT_CONFIG.night.mid).toBe(0x4a3a6b);
    expect(DISTANT_SCENERY_CONFIG.xFractions).toEqual([0.12, 0.5, 0.85]);
    expect(BIRDS_CONFIG.count).toBe(2);
    expect(BIRDS_CONFIG.depth).toBe(150);
  });
});
