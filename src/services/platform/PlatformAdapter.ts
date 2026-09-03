/**
 * Pass 29: abstracts platform-lifecycle concerns (ready signals, pause/resume,
 * audio-enabled state, language) the same way SaveProvider already abstracts
 * persistence. Gameplay code (StationScene, Guest, any system) never touches
 * the YouTube Playables SDK — it isn't even imported there. Only this file
 * and its YouTube-specific implementation know the SDK exists.
 */
export interface PlatformAdapter {
  readonly isPlayablesEnv: boolean;

  /** Call once the first frame has actually rendered. */
  signalFirstFrameReady(): void;

  /** Call once the game is ready for user interaction (matches Plan: "main menu or ready to play"). */
  signalGameReady(): void;

  onPause(callback: () => void): void;
  onResume(callback: () => void): void;

  isAudioEnabled(): boolean;
  onAudioEnabledChange(callback: (enabled: boolean) => void): void;

  /** BCP-47-ish locale string, or null if unknown/unavailable. */
  getLanguage(): string | null;
}
