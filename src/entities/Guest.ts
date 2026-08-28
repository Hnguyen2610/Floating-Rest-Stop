import Phaser from 'phaser';
import { PALETTE } from '../core/GameConfig';
import type { EmotionMeta } from '../systems/EmotionSystem';
import type { GuestState } from '../types/guest';

export abstract class Guest extends Phaser.GameObjects.Container {
  protected readonly baseY: number;
  private idleTime = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    protected guestState: GuestState,
    protected emotionMeta: EmotionMeta,
  ) {
    super(scene, x, y);
    this.baseY = y;
    scene.add.existing(this);
    this.drawBody();
    this.addFace();
  }

  update(_time: number, delta: number): void {
    this.idleTime += delta / 1000;
    this.y = this.baseY + Math.sin(this.idleTime * 1.4) * 6;
  }

  playArrive(): void {
    this.setAlpha(0);
    this.setScale(0.6);
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      scale: 1,
      duration: 400,
      ease: 'Back.easeOut',
    });
  }

  playLeave(onComplete: () => void): void {
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scale: 0.6,
      y: this.y - 40,
      duration: 350,
      ease: 'Sine.easeIn',
      onComplete,
    });
  }

  protected hexToColor(hex: string): number {
    return parseInt(hex.replace('#', ''), 16);
  }

  protected addFace(): void {
    const leftEye = this.scene.add.ellipse(-10, -4, 6, 8, PALETTE.eyeColor);
    const rightEye = this.scene.add.ellipse(10, -4, 6, 8, PALETTE.eyeColor);
    this.add([leftEye, rightEye]);
  }

  protected abstract drawBody(): void;
}
