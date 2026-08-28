import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PALETTE } from '../core/GameConfig';
import { Cloudy } from '../entities/Cloudy';

export class StationScene extends Phaser.Scene {
  private cloudy!: Cloudy;

  constructor() {
    super('StationScene');
  }

  create(): void {
    this.drawSky();
    this.drawPlatform();
    this.drawTitle();
    this.cloudy = new Cloudy(this, GAME_WIDTH / 2, GAME_HEIGHT * 0.48);
    this.wireDebugKeys();
  }

  update(time: number, delta: number): void {
    this.cloudy.update(time, delta);
  }

  private wireDebugKeys(): void {
    if (!import.meta.env.DEV) return;
    this.input.keyboard?.on('keydown-H', () => this.cloudy.playHappyBounce());
  }

  private drawSky(): void {
    const sky = this.add.graphics();
    sky.fillGradientStyle(PALETTE.skyTop, PALETTE.skyTop, PALETTE.skyBottom, PALETTE.skyBottom, 1);
    sky.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }

  private drawPlatform(): void {
    const platform = this.add.graphics();
    const centerX = GAME_WIDTH / 2;
    const centerY = GAME_HEIGHT * 0.72;

    platform.fillStyle(PALETTE.cloudWhite, 1);
    platform.fillEllipse(centerX, centerY, 420, 140);
    platform.fillStyle(PALETTE.mint, 0.5);
    platform.fillEllipse(centerX - 90, centerY - 20, 160, 70);
    platform.fillStyle(PALETTE.pastelPink, 0.5);
    platform.fillEllipse(centerX + 110, centerY - 10, 140, 60);
  }

  private drawTitle(): void {
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.18, 'Trạm Dừng Chân Lơ Lửng', {
        fontFamily: 'Georgia, serif',
        fontSize: '40px',
        color: '#5b4a63',
      })
      .setOrigin(0.5);
  }
}
