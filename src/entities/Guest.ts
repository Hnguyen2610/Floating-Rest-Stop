import Phaser from 'phaser';
import { PALETTE, GUEST_IDLE_CONFIG } from '../core/GameConfig';
import { resolveEmotionAsset, hasLoadedTexture } from '../core/AssetRegistry';
import { HapticFeedback } from '../utils/HapticFeedback';
import type { EmotionMeta } from '../systems/EmotionSystem';
import type { GuestState } from '../types/guest';
import { FloatingShadow } from './FloatingShadow';
import { ParticleEffect } from '../utils/ParticleEffect';

export type GuestInteraction = { type: 'tap' } | { type: 'rub'; distance: number };

// Illustrated guest art occupies roughly the same visual footprint as the
// procedural bodies it replaces (Sun's rays reach ~radius 60, others are
// similar) — same width-based scaling pattern as Cloudy.ts / FloatingIngredient.ts.
const GUEST_SPRITE_TARGET_WIDTH = 150;

export abstract class Guest extends Phaser.GameObjects.Container {
  protected readonly baseX: number;
  protected readonly baseY: number;
  protected readonly bodyGraphics: Phaser.GameObjects.Graphics;
  private readonly shadow: FloatingShadow;
  private spriteImage: Phaser.GameObjects.Image | null = null;
  private idleTime = Math.random() * Math.PI * 2;
  private leftEye: Phaser.GameObjects.Ellipse | null = null;
  private rightEye: Phaser.GameObjects.Ellipse | null = null;
  private blinkTimer: Phaser.Time.TimerEvent | null = null;
  private readonly handleScenePause = (): void => {
    this.scene.tweens.pauseAll();
  };
  private readonly handleSceneResume = (): void => {
    this.scene.tweens.resumeAll();
  };

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
    this.shadow = new FloatingShadow(scene, x);
    scene.add.existing(this);

    this.bodyGraphics = scene.add.graphics();
    this.add(this.bodyGraphics);
    this.addFace();
    this.renderVisual();
    this.wireInteraction();
    this.scheduleNextBlink();

    // Pause/resume every tween on this guest (blink included) when the scene
    // pauses — named handlers so destroy() can actually remove them again;
    // scene.events is a shared emitter, not this object's own, so a leaked
    // listener here would outlive the guest that registered it.
    this.scene.events.on('pause', this.handleScenePause);
    this.scene.events.on('resume', this.handleSceneResume);
  }

  // Blinks only the eyes (not the whole body) and reschedules itself after a
  // real gap — a single-shot tween + delayedCall loop, same pattern already
  // proven in Cloudy.ts, rather than a repeat:-1 tween (which has no gap
  // between repeats without an explicit repeatDelay).
  private scheduleNextBlink(): void {
    this.blinkTimer = this.scene.time.delayedCall(Phaser.Math.Between(2500, 4500), () => {
      if (!this.leftEye || !this.rightEye || !this.leftEye.visible) {
        this.scheduleNextBlink();
        return;
      }
      this.scene.tweens.add({
        targets: [this.leftEye, this.rightEye],
        scaleY: 0.1,
        duration: 90,
        yoyo: true,
        ease: 'Sine.easeInOut',
      });
      this.scheduleNextBlink();
    });
  }

  update(_time: number, delta: number): void {
    this.idleTime += delta / 1000;
    const floatSin = Math.sin(this.idleTime * GUEST_IDLE_CONFIG.floatFrequency);
    // Bobbing (up and down) using sine wave
    this.y = this.baseY + floatSin * GUEST_IDLE_CONFIG.floatAmplitude;
    // Drift (side to side)
    this.x =
      this.baseX +
      Math.sin(this.idleTime * GUEST_IDLE_CONFIG.driftFrequency) * GUEST_IDLE_CONFIG.driftAmplitude;
    this.shadow.sync(this.x, floatSin);
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
      this.spriteImage.setVisible(true);
      this.spriteImage.setScale(GUEST_SPRITE_TARGET_WIDTH / this.spriteImage.width);
      // Illustrated art already has a face baked in — hide the procedural eyes.
      this.leftEye?.setVisible(false);
      this.rightEye?.setVisible(false);
      return;
    }

    this.spriteImage?.setVisible(false);
    this.bodyGraphics.setVisible(true);
    this.bodyGraphics.clear();
    this.renderBody(this.bodyGraphics);
    this.leftEye?.setVisible(true);
    this.rightEye?.setVisible(true);
  }

  playArrive(): void {
    this.setAlpha(0);
    this.setScale(0.6);
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      scale: 1,
      duration: 500,
      ease: 'Back.easeOut',
    });
    ParticleEffect.createSparkleEffect(this.scene, this.x, this.y);
  }

  playLeave(onComplete: () => void): void {
    ParticleEffect.createGlowEffect(this.scene, this.x, this.y);
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scale: 0.6,
      y: this.y - 40,
      duration: 500,
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

  // "No, not that one" cue for a wrong-potion tap — angle-only, same reason
  // as Cloudy.playGlanceAtGuest(): update() rewrites x/y from baseX/baseY
  // every frame, so tweening either here would just get overwritten on the
  // next frame. A quick head-shake reads clearly at guest scale without
  // needing a new sprite or texture.
  playRejectShake(): void {
    this.scene.tweens.chain({
      targets: this,
      tweens: [
        { angle: -8, duration: 60, ease: 'Sine.easeOut' },
        { angle: 8, duration: 100, ease: 'Sine.easeInOut' },
        { angle: -5, duration: 90, ease: 'Sine.easeInOut' },
        { angle: 0, duration: 80, ease: 'Sine.easeOut' },
      ],
    });
  }


  protected hexToColor(hex: string): number {
    return parseInt(hex.replace('#', ''), 16);
  }

  protected addFace(): void {
    this.leftEye = this.scene.add.ellipse(-10, -4, 6, 8, PALETTE.eyeColor);
    this.rightEye = this.scene.add.ellipse(10, -4, 6, 8, PALETTE.eyeColor);
    this.add([this.leftEye, this.rightEye]);
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
    HapticFeedback.trigger();
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

  destroy(fromScene?: boolean): void {
    // Phaser's own GameObject.destroy() is safe to call twice (it no-ops on
    // the second call) and nulls `this.scene` as part of the first pass — a
    // stale activeGuestEntity reference surviving a scene restart (Station
    // reuses one instance across Journal round-trips) can reach here after
    // that already happened, so this must tolerate `this.scene` being gone
    // rather than assume the constructor's setup still holds.
    if (this.scene) {
      this.scene.events.off('pause', this.handleScenePause);
      this.scene.events.off('resume', this.handleSceneResume);
    }
    // Guests (unlike Cloudy) are routinely destroyed while the scene stays
    // alive (every visit ends this way) — cancel the pending blink so it
    // doesn't fire against a destroyed container later.
    this.blinkTimer?.remove();
    this.shadow.destroy();
    super.destroy(fromScene);
  }
}