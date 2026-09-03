/**
 * Placeholder SFX/ambience via Web Audio oscillators and generated noise — no
 * external/copyrighted audio assets, matching the same "temporary but
 * polished" philosophy used for Phaser Graphics placeholder art. Swap for
 * real audio clips later without touching any call site: every caller only
 * ever sees playCollectSound() / setAmbienceContext() / etc.
 *
 * Bus architecture: MASTER -> { MUSIC, AMBIENCE, SFX }. Music has a volume
 * control and a bus ready to receive a track later, but no track plays yet —
 * there's no music asset to hook up, and composing one is out of scope here.
 */
export type AudioBus = 'music' | 'ambience' | 'sfx';

export interface AmbienceContext {
  isNight: boolean;
  hasWindGarden: boolean;
  hasRainGarden: boolean;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

interface AmbienceLayer {
  stop: () => void;
}

export class AudioSystem {
  private context: AudioContext | null = null;
  private muted = false;
  private masterVolume = 0.6;
  private busVolumes: Record<AudioBus, number> = { music: 0.5, ambience: 0.4, sfx: 0.7 };

  private masterGain: GainNode | null = null;
  private busGains: Partial<Record<AudioBus, GainNode>> = {};

  private ambienceLayers = new Map<string, AmbienceLayer>();

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.masterGain) this.masterGain.gain.value = muted ? 0 : this.masterVolume;
  }

  isMuted(): boolean {
    return this.muted;
  }

  setMasterVolume(volume: number): void {
    this.masterVolume = clamp01(volume);
    if (this.masterGain && !this.muted) this.masterGain.gain.value = this.masterVolume;
  }

  getMasterVolume(): number {
    return this.masterVolume;
  }

  setBusVolume(bus: AudioBus, volume: number): void {
    this.busVolumes[bus] = clamp01(volume);
    const gain = this.busGains[bus];
    if (gain) gain.gain.value = this.busVolumes[bus];
  }

  getBusVolume(bus: AudioBus): number {
    return this.busVolumes[bus];
  }

  // --- SFX ---------------------------------------------------------------

  playCollectSound(): void {
    this.playTone(880, 0.18, 0.3, 'sfx');
  }

  playChimeSound(): void {
    this.playTone(660, 0.3, 0.22, 'sfx');
  }

  playCraftSuccessSound(): void {
    this.playTone(523, 0.15, 0.25, 'sfx');
    this.playTone(784, 0.2, 0.25, 'sfx', 0.09);
  }

  playCraftFailSound(): void {
    this.playTone(220, 0.18, 0.22, 'sfx');
  }

  playCaptureSound(): void {
    this.playTone(988, 0.12, 0.28, 'sfx');
  }

  /** Little Star's gentle-rub interaction. */
  playPolishSound(): void {
    this.playTone(1200, 0.06, 0.12, 'sfx');
  }

  /** Journal card flip. */
  playPageSound(): void {
    this.playTone(400, 0.08, 0.15, 'sfx');
    this.playTone(340, 0.1, 0.12, 'sfx', 0.05);
  }

  /** Paper Boat fold step. */
  playFoldSound(): void {
    this.playTone(500, 0.07, 0.18, 'sfx');
  }

  /** Paper Boat released into the wind. */
  playReleaseSound(): void {
    this.playSweep(600, 1100, 0.5, 0.2, 'sfx');
  }

  // --- Ambience ------------------------------------------------------------

  // Called whenever station context changes (area unlocked, day/night toggled,
  // scene created) — each layer is synced against whether it's already
  // playing, so only the layers that actually changed start or stop.
  setAmbienceContext(context: AmbienceContext): void {
    const ctx = this.getContext();
    if (!ctx) return;

    this.syncLayer('wind', true, () => this.startWindLayer(ctx));
    this.syncLayer('night', context.isNight, () => this.startNightLayer(ctx));
    this.syncLayer('chimes', context.hasWindGarden, () => this.startChimeLayer());
    this.syncLayer('rain', context.hasRainGarden, () => this.startRainLayer(ctx));
  }

  private syncLayer(id: string, shouldPlay: boolean, start: () => AmbienceLayer): void {
    const playing = this.ambienceLayers.has(id);
    if (shouldPlay && !playing) {
      this.ambienceLayers.set(id, start());
    } else if (!shouldPlay && playing) {
      this.ambienceLayers.get(id)?.stop();
      this.ambienceLayers.delete(id);
    }
  }

  private startWindLayer(ctx: AudioContext): AmbienceLayer {
    return this.startNoiseLayer(ctx, { type: 'lowpass', frequency: 500 }, 0.05);
  }

  private startRainLayer(ctx: AudioContext): AmbienceLayer {
    return this.startNoiseLayer(ctx, { type: 'bandpass', frequency: 2200 }, 0.04);
  }

  private startNightLayer(ctx: AudioContext): AmbienceLayer {
    const bus = this.getBusGain('ambience', ctx);
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(bus);

    const oscillator = ctx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = 80;
    oscillator.connect(gain);
    oscillator.start();

    gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 1.5);

    return {
      stop: () => {
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
        oscillator.stop(ctx.currentTime + 0.9);
      },
    };
  }

  private startNoiseLayer(
    ctx: AudioContext,
    filter: { type: BiquadFilterType; frequency: number },
    targetVolume: number,
  ): AmbienceLayer {
    const bus = this.getBusGain('ambience', ctx);
    const gain = ctx.createGain();
    gain.gain.value = 0;

    const biquad = ctx.createBiquadFilter();
    biquad.type = filter.type;
    biquad.frequency.value = filter.frequency;

    const bufferSeconds = 2;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * bufferSeconds, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    source.connect(biquad);
    biquad.connect(gain);
    gain.connect(bus);
    source.start();

    gain.gain.linearRampToValueAtTime(targetVolume, ctx.currentTime + 1.5);

    return {
      stop: () => {
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
        source.stop(ctx.currentTime + 0.9);
      },
    };
  }

  private startChimeLayer(): AmbienceLayer {
    let stopped = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const scheduleNext = () => {
      if (stopped) return;
      const delayMs = 4000 + Math.random() * 5000;
      timeoutId = setTimeout(() => {
        if (stopped) return;
        const notes = [660, 784, 880];
        this.playTone(notes[Math.floor(Math.random() * notes.length)], 0.4, 0.08, 'ambience');
        scheduleNext();
      }, delayMs);
    };
    scheduleNext();

    return {
      stop: () => {
        stopped = true;
        if (timeoutId) clearTimeout(timeoutId);
      },
    };
  }

  // --- Low-level tone/sweep helpers ---------------------------------------

  private playTone(frequency: number, duration: number, volume: number, bus: AudioBus, delaySeconds = 0): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const startAt = ctx.currentTime + delaySeconds;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(0, startAt);
    gain.gain.linearRampToValueAtTime(volume, startAt + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

    oscillator.connect(gain);
    gain.connect(this.getBusGain(bus, ctx));
    oscillator.start(startAt);
    oscillator.stop(startAt + duration);
  }

  private playSweep(fromFreq: number, toFreq: number, duration: number, volume: number, bus: AudioBus): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const startAt = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(fromFreq, startAt);
    oscillator.frequency.linearRampToValueAtTime(toFreq, startAt + duration);

    gain.gain.setValueAtTime(0, startAt);
    gain.gain.linearRampToValueAtTime(volume, startAt + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

    oscillator.connect(gain);
    gain.connect(this.getBusGain(bus, ctx));
    oscillator.start(startAt);
    oscillator.stop(startAt + duration);
  }

  private getBusGain(bus: AudioBus, ctx: AudioContext): GainNode {
    let gain = this.busGains[bus];
    if (!gain) {
      gain = ctx.createGain();
      gain.gain.value = this.busVolumes[bus];
      gain.connect(this.getMasterGain(ctx));
      this.busGains[bus] = gain;
    }
    return gain;
  }

  private getMasterGain(ctx: AudioContext): GainNode {
    if (!this.masterGain) {
      this.masterGain = ctx.createGain();
      this.masterGain.gain.value = this.muted ? 0 : this.masterVolume;
      this.masterGain.connect(ctx.destination);
    }
    return this.masterGain;
  }

  private getContext(): AudioContext | null {
    // Mute is a master-gain-to-zero operation, not a context gate — ambience
    // layers are stateful (start/stop across mute toggles), so the graph
    // needs to keep existing even while silenced.
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
