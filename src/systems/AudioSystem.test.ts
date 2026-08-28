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
    expect(() => system.playCaptureSound()).not.toThrow();
  });

  it('never throws when muted', () => {
    const system = new AudioSystem();
    system.setMuted(true);
    expect(() => system.playCollectSound()).not.toThrow();
  });
});
