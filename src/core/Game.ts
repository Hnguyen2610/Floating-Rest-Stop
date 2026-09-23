import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './GameConfig';
import { BootScene } from '../scenes/BootScene';
import { PreloadScene } from '../scenes/PreloadScene';
import { StationScene } from '../scenes/StationScene';
import { JournalScene } from '../scenes/JournalScene';
import { initPlatformAdapter } from './Platform';
import { getGameSystems } from './GameSystems';
import { installOrientationGuard } from '../ui/OrientationGuard';
import { installScaleClamp } from '../ui/ScaleClamp';

export function createGame(parent: string): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#a9d8f0',
    scale: {
      // ENVELOP fills the whole viewport (cropping whichever axis overflows)
      // instead of FIT's letterbox bars — see docs/superpowers/specs/2026-09-18-
      // fullscreen-responsive-design.md for the safe-zone margin that keeps
      // every interactive control on-screen despite the crop.
      mode: Phaser.Scale.ENVELOP,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [BootScene, PreloadScene, StationScene, JournalScene],
  };

  const platform = initPlatformAdapter();
  const game = new Phaser.Game(config);
  installOrientationGuard(game);
  const appEl = document.getElementById(parent);
  if (appEl) installScaleClamp(game, appEl);

  game.events.once(Phaser.Core.Events.POST_RENDER, () => {
    platform.signalFirstFrameReady();
  });

  platform.onPause(() => {
    game.loop.sleep();
    // Systems may not exist yet if paused during boot — nothing to save then.
    // save:failed (SaveStatusUI, listening on the scene's own eventBus) is
    // what actually surfaces a problem to the player; this catch just keeps
    // a rejected promise from becoming an unhandled rejection.
    try {
      getGameSystems().saveSystem.saveNow().catch(() => undefined);
    } catch {
      /* not initialized yet */
    }
  });

  platform.onResume(() => {
    game.loop.wake();
  });

  return game;
}
