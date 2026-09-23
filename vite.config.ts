import { defineConfig } from 'vitest/config';
import type { Plugin } from 'vite';

// YouTube Playables requires its own SDK script tag (see src/types/ytgame.d.ts)
// but that tag must NOT be present in the regular web build — every normal
// deploy (dev, itch.io, GitHub Pages) has to keep working with zero
// YouTube-specific network calls. Rather than maintaining two near-duplicate
// index.html files, a single index.html stays platform-neutral and this
// plugin injects the SDK tag only when building in `playables` mode
// (`vite build --mode playables`, see package.json's build:playables script).
function injectPlayablesSdk(): Plugin {
  return {
    name: 'inject-youtube-playables-sdk',
    transformIndexHtml(html) {
      // Inserted right before the game's own <script type="module">, not just
      // anywhere in <head> — a classic script here runs synchronously at its
      // position during parsing, while the module script is deferred until
      // parsing finishes, so this ordering guarantees window.ytgame exists
      // before Game.ts's initPlatformAdapter() reads it, regardless of
      // where else things get injected.
      return html.replace(
        '<script type="module"',
        '<script src="https://www.youtube.com/game_api/v1"></script>\n    <script type="module"',
      );
    },
  };
}

export default defineConfig(({ mode }) => {
  const isPlayablesBuild = mode === 'playables';
  return {
    // Relative base so the built index.html references ./assets/... instead
    // of /assets/... — required for GitHub Pages project sites (served from
    // a subpath, not domain root), itch.io (served from its own subpath),
    // and YouTube Playables (embedded, mount path unknown ahead of time).
    base: './',
    plugins: isPlayablesBuild ? [injectPlayablesSdk()] : [],
    build: {
      outDir: isPlayablesBuild ? 'dist-playables' : 'dist',
      rolldownOptions: {
        output: {
          // Phaser is the bulk of the single-file bundle (the build warning
          // this silences) and changes far less often than our own game
          // code — its own chunk means a browser that already cached it
          // from a previous visit/deploy doesn't re-download it just
          // because a gameplay file changed. This build (vite 8.x) uses
          // Rolldown under the hood, hence `rolldownOptions` rather than
          // the classic Rollup-era `rollupOptions`.
          manualChunks(id) {
            if (id.includes('node_modules/phaser')) return 'phaser';
          },
        },
      },
    },
    test: {
      environment: 'node',
      include: ['src/**/*.test.ts'],
      fileParallelism: false,
    },
  };
});
