import Phaser from 'phaser';
import { PALETTE, GUEST_IDLE_CONFIG } from '../core/GameConfig';
import { resolveEmotionAsset, hasLoadedTexture } from '../core/AssetRegistry';
import type { EmotionMeta } from '../systems/EmotionSystem';
import type { GuestState } from '../types/guest';

export type GuestInteraction = { type: 'tap' } | { type: 'rub'; distance: number };

export abstract class Guest extends Phaser.GameObjects.Container {
  protected readonly baseX: number;
  protected readonly baseY: number;
  protected readonly bodyGraphics: Phaser.GameObjects.Graphics;
  private spriteImage: Phaser.GameObjects.Image | null = null;
  private idleTime = Math.random() * Math.PI * 2;
  private blinkTween: Phaser.Tweens.Tween | null = null;

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
    this.renderVisual();
    this.addFace();
    this.wireInteraction();

    // Blinking tween (scaleY briefly)
    this.blinkTween = this.scene.tweens.add({
      targets: this,
      scaleY: 0.9,
      duration: 200,
      yoyo: true,
      repeat: -1,
      delay: 3000,
      ease: 'Linear'
    });

    // Pause/resume tweens when scene is paused/resumed (only for blinkTween)
    this.scene.events.on('pause', () => {
      this.blinkTween?.pause();
    });
    this.scene.events.on('resume', () => {
      this.blinkTween?.resume();
    });
  }

  update(_time: number, delta: number): void {
    this.idleTime += delta / 1000;
    // Bobbing (up and down) using sine wave
    this.y = this.baseY + Math.sin(this.idleTime * GUEST_IDLE_CONFIG.floatFrequency) * GUEST_IDLE_CONFIG.floatAmplitude;
    // Drift (side to side)
    this.x =
      this.baseX +
      Math.sin(this.idleTime * GUEST_IDLE_CONFIG.driftFrequency) * GUEST_IDLE_CONFIG.driftAmplitude;
  }

  updateEmotion(meta: EmotionMeta): void {
    this.emotionMeta = meta;
    this.renderVisual();
    this.playRelief();
  }

  // Presentation-layer asset swap point (Pass 26): if a real texture is
  // registered and preloaded for this guest's current emotion, draw that
  // instead of the procedural placeholder — renderBody() itself never
  // changes, so every guest subclass is already swap-ready for free.
  private renderVisual(): void {
    const asset = resolveEmotionAsset(this.guestState.currentEmotion);
    if (hasLoadedTexture(this.scene, asset)) {
      this.bodyGraphics.clear();
      this.bodyGraphics.setVisible(false);
      if (!this.spriteImage) {
        this.spriteImage = this.scene.add.image(0, 0, asset.key);
        this.addAt(this.spriteImage, 0);
      } else {
        this.spriteImage.setTexture(asset.key);
      }
      return;
    }

    this.spriteImage?.setVisible(false);
    this.bodyGraphics.setVisible(true);
    this.bodyGraphics.clear();
    this.renderBody(this.bodyGraphics);
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
    this.on('pointerdown', () => {
      this.playTapAcknowledge();
      this.onInteract({ type: 'tap' });
    });
  }

  // Immediate acknowledgment that the tap registered, independent of whether
  // it actually did anything — INPUT should never go unanswered while the
  // game decides what the RESULT is.
  private playTapAcknowledge(): void {
    this.scene.tweens.add({
      targets: this,
      scaleX: 0.92,
      scaleY: 1.06,
      duration: 70,
      yoyo: true,
      ease: 'Sine.easeOut',
    });
  }

  protected abstract renderBody(graphics: Phaser.GameObjects.Graphics): void;

  /** Override to stop tweens and remove listeners when guest is destroyed */
  destroy(fromScene?: boolean): void {
    // Stop tweens
    if (this.blinkTween) {
      this.blinkTween.stop();
    }
    // Remove scene listeners
    this.scene.events.off('pause', () => {
      /* eslint-disable-next-line @typescript-eslint/no-empty-function */
    });
    this.scene.events.off('resume', () => {
      /* eslint-disable-next-line @typescript-eslint/no-empty-function */
    });
    super.destroy(fromScene);
  }
}