/**
 * Ambient type declarations for the YouTube Playables SDK (`window.ytgame`).
 * Verified against https://developers.google.com/youtube/gaming/playables/reference/getting_started
 * (Pass 29). The SDK script (`https://www.youtube.com/game_api/v1`) is only
 * present when the game is actually embedded as a YouTube Playable — every
 * consumer of this global must guard with `typeof window !== 'undefined' &&
 * 'ytgame' in window` before touching it (see YouTubePlayablesPlatformAdapter
 * and YouTubePlayablesSaveProvider, the only two files that do).
 */
interface YTGameAPI {
  readonly IN_PLAYABLES_ENV: boolean;
  game: {
    firstFrameReady(): void;
    gameReady(): void;
    loadData(): Promise<string | null>;
    saveData(data: string): Promise<void>;
  };
  system: {
    onPause(callback: () => void): void;
    onResume(callback: () => void): void;
    isAudioEnabled(): boolean;
    onAudioEnabledChange(callback: (isAudioEnabled: boolean) => void): void;
    getLanguage(): string;
  };
}

interface Window {
  ytgame?: YTGameAPI;
}
