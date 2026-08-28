import Phaser from 'phaser';
import { PALETTE, GUEST_IDLE_CONFIG } from '../core/GameConfig';
import type { EmotionMeta } from '../systems/EmotionSystem';
import type { GuestState } from '../types/guest';

export type GuestInteraction = { type: 'tap' } | { type: 'rub'; distance: number };

export abstract class Guest extends Phaser.GameObjects.Container {
  protected readonly baseX: number;
  protected readonly baseY: number;
  protected readonly bodyGraphics: Phaser.GameObjects.Graphics;
  private idleTime = Math.random() * Math.PI * 2;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    protected guestState: GuestState,
    protected emotionMeta: EmotionMeta,
    protected onInteract: (interaction: GuestInteraction) => void,
  ) {
    super(scene, x, y);
    this.baseX = x;
    this.baseY = y;
    scene.add.existing(this);

    this.bodyGraphics = scene.add.graphics();
    this.add(this.bodyGraphics);
    this.renderBody(this.bodyGraphics);
    this.addFace();
    this.wireInteraction();
  }

  update(_time: number, delta: number): void {
    this.idleTime += delta / 1000;
    this.y = this.baseY + Math.sin(this.idleTime * GUEST_IDLE_CONFIG.floatFrequency) * GUEST_IDLE_CONFIG.floatAmplitude;
    this.x =
      this.baseX +
      Math.sin(this.idleTime * GUEST_IDLE_CONFIG.driftFrequency) * GUEST_IDLE_CONFIG.driftAmplitude;
  }

  updateEmotion(meta: EmotionMeta): void {
    this.emotionMeta = meta;
    this.bodyGraphics.clear();
    this.renderBody(this.bodyGraphics);
    this.playRelief();
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

  protected playRelief(): void {
    this.scene.tweens.add({
      targets: this,
      scale: 1.12,
      duration: 160,
      yoyo: true,
      ease: 'Sine.easeOut',
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

  protected wireInteraction(): void {
    this.setSize(100, 100);
    // Container hit-test coords are relative to the top-left of setSize(), not the
    // container's origin, so a centered circle must sit at (width/2, height/2).
    this.setInteractive(new Phaser.Geom.Circle(50, 50, 50), Phaser.Geom.Circle.Contains);
    this.on('pointerdown', () => this.onInteract({ type: 'tap' }));
  }

  protected abstract renderBody(graphics: Phaser.GameObjects.Graphics): void;
}
