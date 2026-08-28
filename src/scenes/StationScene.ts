import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PALETTE } from '../core/GameConfig';
import { Cloudy } from '../entities/Cloudy';
import { Guest } from '../entities/Guest';
import { SunGuest } from '../guests/SunGuest';
import { MoonGuest } from '../guests/MoonGuest';
import { LittleStarGuest } from '../guests/LittleStarGuest';
import { EmotionSystem, type EmotionsData } from '../systems/EmotionSystem';
import { GuestSystem, type GuestsData } from '../systems/GuestSystem';
import { eventBus } from '../core/EventBus';
import type { GuestState } from '../types/guest';

export class StationScene extends Phaser.Scene {
  private cloudy!: Cloudy;
  private emotionSystem!: EmotionSystem;
  private guestSystem!: GuestSystem;
  private activeGuestEntity: Guest | null = null;

  constructor() {
    super('StationScene');
  }

  create(): void {
    this.drawSky();
    this.drawPlatform();
    this.drawTitle();
    this.cloudy = new Cloudy(this, GAME_WIDTH / 2, GAME_HEIGHT * 0.48);

    const guestsData = this.cache.json.get('guests') as GuestsData;
    const emotionsData = this.cache.json.get('emotions') as EmotionsData;
    this.emotionSystem = new EmotionSystem(emotionsData);
    this.guestSystem = new GuestSystem(guestsData, this.emotionSystem, eventBus);

    eventBus.on('guest:arrived', (state) => this.onGuestArrived(state));
    eventBus.on('guest:left', () => this.onGuestLeft());

    this.wireDebugKeys();
  }

  update(time: number, delta: number): void {
    this.cloudy.update(time, delta);
    this.activeGuestEntity?.update(time, delta);
  }

  private onGuestArrived(state: GuestState): void {
    this.activeGuestEntity?.destroy();
    const meta = this.emotionSystem.getEmotionMeta(state.currentEmotion);
    const x = GAME_WIDTH * 0.24;
    const y = GAME_HEIGHT * 0.42;
    this.activeGuestEntity = this.createGuestEntity(state, meta, x, y);
    this.activeGuestEntity.playArrive();
  }

  private createGuestEntity(
    state: GuestState,
    meta: { label: string; color: string },
    x: number,
    y: number,
  ): Guest {
    switch (state.id) {
      case 'sun':
        return new SunGuest(this, x, y, state, meta);
      case 'moon':
        return new MoonGuest(this, x, y, state, meta);
      case 'little_star':
        return new LittleStarGuest(this, x, y, state, meta);
      default:
        throw new Error(`Unknown guest id: ${state.id}`);
    }
  }

  private onGuestLeft(): void {
    const entity = this.activeGuestEntity;
    if (!entity) return;
    this.activeGuestEntity = null;
    entity.playLeave(() => entity.destroy());
  }

  private wireDebugKeys(): void {
    if (!import.meta.env.DEV) return;
    this.input.keyboard?.on('keydown-H', () => this.cloudy.playHappyBounce());
    this.input.keyboard?.on('keydown-ONE', () => this.guestSystem.spawn('sun'));
    this.input.keyboard?.on('keydown-TWO', () => this.guestSystem.spawn('moon'));
    this.input.keyboard?.on('keydown-THREE', () => this.guestSystem.spawn('little_star'));
    this.input.keyboard?.on('keydown-Q', () => this.guestSystem.leave());
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
