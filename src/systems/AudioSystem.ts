/**
 * Placeholder SFX via Web Audio oscillators — no external/copyrighted audio
 * assets, matching the same "temporary but polished" philosophy used for
 * Phaser Graphics placeholder art. Swap for real audio clips later without
 * touching any call site: every caller only ever sees playCollectSound() /
 * playChimeSound() / playCraftSuccessSound().
 */
export class AudioSystem {
  private context: AudioContext | null = null;
  private muted = false;
  private readonly masterVolume = 0.5;

  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  playCollectSound(): void {
    this.playTone(880, 0.18, 0.3);
  }

  playChimeSound(): void {
    this.playTone(660, 0.3, 0.22);
  }

  playCraftSuccessSound(): void {
    this.playTone(523, 0.15, 0.25);
    this.playTone(784, 0.2, 0.25, 0.09);
  }

  playCraftFailSound(): void {
    this.playTone(220, 0.18, 0.22);
  }

  playCaptureSound(): void {
    this.playTone(988, 0.12, 0.28);
  }

  private playTone(frequency: number, duration: number, volume: number, delaySeconds = 0): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const startAt = ctx.currentTime + delaySeconds;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(0, startAt);
    gain.gain.linearRampToValueAtTime(volume * this.masterVolume, startAt + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration);
  }

  private getContext(): AudioContext | null {
    if (this.muted) return null;
    if (typeof window === 'undefined') return null;

    if (!this.context) {
      const Ctor = window.AudioContext ?? (window as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
      if (!Ctor) return null;
      this.context = new Ctor();
    }
    return this.context;
  }
}
