import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './GameConfig';
import { BootScene } from '../scenes/BootScene';
import { PreloadScene } from '../scenes/PreloadScene';
import { StationScene } from '../scenes/StationScene';
import { JournalScene } from '../scenes/JournalScene';
import { initPlatformAdapter } from './Platform';
import { getGameSystems } from './GameSystems';

export function createGame(parent: string): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#a9d8f0',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [BootScene, PreloadScene, StationScene, JournalScene],
  };

  const platform = initPlatformAdapter();
  const game = new Phaser.Game(config);

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
