import { describe, expect, it } from 'vitest';
import { blendHexColors } from './liquidBlend';

describe('blendHexColors', () => {
  it('returns the color unchanged when given a single ingredient', () => {
    expect(blendHexColors(['#bfe3d0'])).toBe(0xbfe3d0);
  });

  it('averages two colors channel-by-channel', () => {
    expect(blendHexColors(['#000000', '#ffffff'])).toBe(0x808080);
  });

  it('returns white for an empty list (no ingredients yet)', () => {
    expect(blendHexColors([])).toBe(0xffffff);
  });
});
