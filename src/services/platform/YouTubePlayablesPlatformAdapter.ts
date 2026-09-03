import type { PlatformAdapter } from './PlatformAdapter';

/**
 * Real YouTube Playables SDK adapter. Only ever constructed after
 * `isPlayablesEnvironment()` has confirmed `window.ytgame` exists — every
 * method below still individually optional-chains the SDK anyway, since a
 * pause/resume/audio callback could theoretically fire (or this adapter
 * could be constructed) before the SDK finished attaching itself.
 */
export class YouTubePlayablesPlatformAdapter implements PlatformAdapter {
  readonly isPlayablesEnv = true;

  signalFirstFrameReady(): void {
    window.ytgame?.game.firstFrameReady();
  }

  signalGameReady(): void {
    window.ytgame?.game.gameReady();
  }

  onPause(callback: () => void): void {
    window.ytgame?.system.onPause(callback);
  }

  onResume(callback: () => void): void {
    window.ytgame?.system.onResume(callback);
  }

  isAudioEnabled(): boolean {
    return window.ytgame?.system.isAudioEnabled() ?? true;
  }

  onAudioEnabledChange(callback: (enabled: boolean) => void): void {
    window.ytgame?.system.onAudioEnabledChange(callback);
  }

  getLanguage(): string | null {
    return window.ytgame?.system.getLanguage() ?? null;
  }
}
