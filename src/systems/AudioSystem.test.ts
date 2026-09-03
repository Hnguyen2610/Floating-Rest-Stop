import { describe, expect, it } from 'vitest';
import { AudioSystem } from './AudioSystem';

describe('AudioSystem', () => {
  it('toggles muted state', () => {
    const system = new AudioSystem();
    expect(system.isMuted()).toBe(false);
    system.setMuted(true);
    expect(system.isMuted()).toBe(true);
  });

  it('never throws when playing sounds outside a browser (no window.AudioContext)', () => {
    const system = new AudioSystem();
    expect(() => system.playCollectSound()).not.toThrow();
    expect(() => system.playChimeSound()).not.toThrow();
    expect(() => system.playCraftSuccessSound()).not.toThrow();
    expect(() => system.playCraftFailSound()).not.toThrow();
    expect(() => system.playCaptureSound()).not.toThrow();
    expect(() => system.playPolishSound()).not.toThrow();
    expect(() => system.playPageSound()).not.toThrow();
    expect(() => system.playFoldSound()).not.toThrow();
    expect(() => system.playReleaseSound()).not.toThrow();
  });

  it('never throws when muted', () => {
    const system = new AudioSystem();
    system.setMuted(true);
    expect(() => system.playCollectSound()).not.toThrow();
  });

  it('clamps and reports master and per-bus volume', () => {
    const system = new AudioSystem();
    system.setMasterVolume(1.5);
    expect(system.getMasterVolume()).toBe(1);
    system.setMasterVolume(-0.5);
    expect(system.getMasterVolume()).toBe(0);

    system.setBusVolume('sfx', 0.3);
    expect(system.getBusVolume('sfx')).toBe(0.3);
    system.setBusVolume('music', 2);
    expect(system.getBusVolume('music')).toBe(1);
    system.setBusVolume('ambience', -1);
    expect(system.getBusVolume('ambience')).toBe(0);
  });

  it('never throws setting ambience context outside a browser', () => {
    const system = new AudioSystem();
    expect(() =>
      system.setAmbienceContext({ isNight: false, hasWindGarden: false, hasRainGarden: false }),
    ).not.toThrow();
    expect(() =>
      system.setAmbienceContext({ isNight: true, hasWindGarden: true, hasRainGarden: true }),
    ).not.toThrow();
    // toggling back off should not throw either (layers were never actually created without a context)
    expect(() =>
      system.setAmbienceContext({ isNight: false, hasWindGarden: false, hasRainGarden: false }),
    ).not.toThrow();
  });
});
