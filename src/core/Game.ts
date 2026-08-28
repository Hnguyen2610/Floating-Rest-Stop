import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './GameConfig';
import { BootScene } from '../scenes/BootScene';
import { PreloadScene } from '../scenes/PreloadScene';
import { StationScene } from '../scenes/StationScene';
import { JournalScene } from '../scenes/JournalScene';

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

  return new Phaser.Game(config);
}
