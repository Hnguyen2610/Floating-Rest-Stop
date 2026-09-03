import type { PlatformAdapter } from './PlatformAdapter';
import { BrowserPlatformAdapter } from './BrowserPlatformAdapter';
import { YouTubePlayablesPlatformAdapter } from './YouTubePlayablesPlatformAdapter';

/** True only when actually embedded as a YouTube Playable — false for every plain-browser visit, including this game's own itch.io/GitHub Pages/local-dev builds. */
export function isPlayablesEnvironment(): boolean {
  return typeof window !== 'undefined' && !!window.ytgame?.IN_PLAYABLES_ENV;
}

export function createPlatformAdapter(): PlatformAdapter {
  return isPlayablesEnvironment() ? new YouTubePlayablesPlatformAdapter() : new BrowserPlatformAdapter();
}
