import type { PlatformAdapter } from './PlatformAdapter';

/**
 * Default adapter for plain-browser play (the only target today). Every
 * signal either no-ops or falls back to a standard Web API, so the game
 * behaves identically to before Pass 29 — this file only exists so
 * `createPlatformAdapter()` always has something to hand back, keeping "no
 * YouTube SDK present" a normal, always-supported case rather than an edge one.
 */
export class BrowserPlatformAdapter implements PlatformAdapter {
  readonly isPlayablesEnv = false;

  signalFirstFrameReady(): void {
    // Nothing to signal outside Playables.
  }

  signalGameReady(): void {
    // Nothing to signal outside Playables.
  }

  onPause(callback: () => void): void {
    if (typeof document === 'undefined') return;
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) callback();
    });
  }

  onResume(callback: () => void): void {
    if (typeof document === 'undefined') return;
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) callback();
    });
  }

  isAudioEnabled(): boolean {
    return true;
  }

  onAudioEnabledChange(): void {
    // The browser has no external "audio enabled" signal to subscribe to —
    // muting here is entirely the player's own in-game choice already.
  }

  getLanguage(): string | null {
    return typeof navigator !== 'undefined' ? navigator.language : null;
  }
}
