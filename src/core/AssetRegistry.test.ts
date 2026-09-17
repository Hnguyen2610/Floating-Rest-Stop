import { describe, expect, it } from 'vitest';
import {
  emotionIdToAssetKey,
  decorationIdToAssetKey,
  cloudyShapeIdToAssetKey,
  resolveAsset,
  resolveEmotionAsset,
  resolveDecorationAsset,
} from './AssetRegistry';

describe('AssetRegistry', () => {
  it('derives guest asset keys from emotion ids', () => {
    expect(emotionIdToAssetKey('SUN_STRESSED')).toBe('guest.sun.stressed');
    expect(emotionIdToAssetKey('MOON_LONELY')).toBe('guest.moon.lonely');
    expect(emotionIdToAssetKey('STAR_HESITANT')).toBe('guest.star.hesitant');
    expect(emotionIdToAssetKey('BUTTERFLY_WET')).toBe('guest.butterfly.wet');
  });

  it('derives decoration asset keys', () => {
    expect(decorationIdToAssetKey('wind_chime')).toBe('decoration.wind_chime');
  });

  it('derives cloudy shape asset keys', () => {
    expect(cloudyShapeIdToAssetKey('heart')).toBe('cloudy.heart');
  });

  it('falls back to a keyed entry with no texturePath when nothing is registered', () => {
    expect(resolveAsset('guest.sun.nonexistent_stage')).toEqual({ key: 'guest.sun.nonexistent_stage' });
    expect(resolveEmotionAsset('SUN_NONEXISTENT_STAGE')).toEqual({ key: 'guest.sun.nonexistent_stage' });
    expect(resolveDecorationAsset('wind_chime')).toEqual({ key: 'decoration.wind_chime' });
  });

  it('resolves the illustrated guest emotion stages with their texture paths', () => {
    expect(resolveEmotionAsset('SUN_STRESSED')).toEqual({
      key: 'guest.sun.stressed',
      texturePath: 'assets/guests/sun/calming.png',
    });
    expect(resolveEmotionAsset('COMET_BRILLIANT')).toEqual({
      key: 'guest.comet.brilliant',
      texturePath: 'assets/guests/comet/peaceful.png',
    });
  });
});
