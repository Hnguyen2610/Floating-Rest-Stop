import Phaser from 'phaser';
import { CLOUDY_CONFIG, POST_FX_CONFIG } from '../core/GameConfig';
import { HapticFeedback } from '../utils/HapticFeedback';
import { FloatingShadow } from './FloatingShadow';

const ICON_TARGET_WIDTH = 160;

type Expression = 'idle' | 'happy' | 'poke' | 'sleepy';

// Where each accessory sits, as a fraction of Cloudy's own current display
// size — stays sensible across shapes with different proportions (default,
// cotton_candy, heart) without needing per-shape tuning.
interface AccessoryPlacement {
  xFrac: number;
  yFrac: number;
  widthFrac: number;
}

const ACCESSORY_PLACEMENT: Record<string, AccessoryPlacement> = {
  sunset_hat: { xFrac: 0, yFrac: -0.62, widthFrac: 0.34 },
  star_clip: { xFrac: 0.38, yFrac: -0.22, widthFrac: 0.26 },
  rainbow_ribbon: { xFrac: -0.02, yFrac: 0.46, widthFrac: 0.3 },
  // Color variants sit in the exact same spot as their base accessory —
  // they're the same item, just recolored.
  sunset_hat_pink: { xFrac: 0, yFrac: -0.62, widthFrac: 0.34 },
  sunset_hat_mint: { xFrac: 0, yFrac: -0.62, widthFrac: 0.34 },
  star_clip_mint: { xFrac: 0.38, yFrac: -0.22, widthFrac: 0.26 },
  star_clip_yellow: { xFrac: 0.38, yFrac: -0.22, widthFrac: 0.26 },
  rainbow_ribbon_pink: { xFrac: -0.02, yFrac: 0.46, widthFrac: 0.3 },
  rainbow_ribbon_lavender: { xFrac: -0.02, yFrac: 0.46, widthFrac: 0.3 },
};

// Illustrated-sprite Cloudy (art pass after Pass 31). Only the "default"
// shape has all 4 expression poses today — cotton_candy/heart only have an
// idle pose so far, and fall back to it for every expression until more art
// exists (see textureKey()). Replaces the earlier live SoftBodyMesh blob:
// squish-on-drag is now a simple scale tween rather than true mesh
// deformation, since a raster illustration can't deform like a vector mesh.
export class Cloudy extends Phaser.GameObjects.Container {
  private readonly sprite: Phaser.GameObjects.Image;
  private readonly shadow: FloatingShadow;
  private accessoryImages: Phaser.GameObjects.Image[] = [];
  private shapeId: string;
  private accessories: string[] = [];
  private readonly baseX: number;
  private readonly baseY: number;
  private idleTime = 0;
  private revertTimer: Phaser.Time.TimerEvent | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, shapeId = 'default') {
    super(scene, x, y);
    this.baseX = x;
    this.baseY = y;
    this.shapeId = shapeId;
    this.shadow = new FloatingShadow(scene, x);
    scene.add.existing(this);

    this.sprite = scene.add.image(0, 0, this.textureKey('idle'));
    this.add(this.sprite);
    this.applyBloom();

    this.applySpriteScale();
    this.updateHitArea();
    this.wireInput();
    this.scheduleNextBlink();
  }

  update(_time: number, delta: number): void {
    const dt = delta / 1000;
    this.idleTime += dt;
    const floatSin = Math.sin(this.idleTime * CLOUDY_CONFIG.floatFrequency);
    this.y = this.baseY + floatSin * CLOUDY_CONFIG.floatAmplitude;
    this.x =
      this.baseX + Math.sin(this.idleTime * CLOUDY_CONFIG.driftFrequency) * CLOUDY_CONFIG.driftAmplitude;
    this.shadow.sync(this.x, floatSin);
  }

  destroy(fromScene?: boolean): void {
    this.shadow.destroy();
    super.destroy(fromScene);
  }

  // Same WebGL guard as StationScene.applyPostFx() — postFX requires WebGL,
  // this game falls back to Canvas2D on devices that can't do it.
  private applyBloom(): void {
    if (this.scene.game.renderer.type !== Phaser.WEBGL) return;
    const { color, offsetX, offsetY, blurStrength, strength, steps } = POST_FX_CONFIG.cloudyBloom;
    this.sprite.postFX.addBloom(color, offsetX, offsetY, blurStrength, strength, steps);
  }


  // Ambient "notice the guest" cue — StationScene calls this occasionally
  // while a guest is present, since standing still the whole visit read as
  // stiff/disconnected in real playtesting. Only tweens `angle`: `update()`
  // recomputes `x`/`y` from baseX/baseY every frame, so a tween touching
  // either of those would just get overwritten on the next frame — the
  // existing gesture methods below avoid that same trap.
  playGlanceAtGuest(towardLeft: boolean): void {
    const leanAngle = towardLeft ? -5 : 5;
    this.scene.tweens.chain({
      targets: this,
      tweens: [
        { angle: leanAngle, duration: 260, ease: 'Sine.easeOut' },
        { angle: 0, duration: 380, ease: 'Sine.easeInOut' },
      ],
    });
  }

  playHappyBounce(): void {
    this.showExpression('happy', 900);
    this.scene.tweens.chain({
      targets: this,
      tweens: [
        { scaleX: 1.15, scaleY: 0.85, duration: 90, ease: 'Sine.easeOut' },
        { scaleX: 0.9, scaleY: 1.2, duration: 140, ease: 'Sine.easeInOut' },
        { scaleX: 1, scaleY: 1, duration: 260, ease: 'Elastic.easeOut' },
      ],
    });
  }

  // Cosmetics (Pass 23): swapping shape swaps the sprite's texture — no
  // physics, no new interaction code, same as the mesh version was designed to be.
  setShape(shapeId: string): void {
    this.shapeId = shapeId;
    this.sprite.setTexture(this.textureKey('idle'));
    this.applySpriteScale();
    this.updateHitArea();
    this.redrawAccessories();
  }

  setAccessories(accessoryIds: string[]): void {
    this.accessories = accessoryIds;
    this.redrawAccessories();
  }

  private textureKey(expression: Expression): string {
    const key = `cloudy-${this.shapeId}-${expression}`;
    return this.scene.textures.exists(key) ? key : `cloudy-${this.shapeId}-idle`;
  }

  private applySpriteScale(): void {
    this.sprite.setScale(ICON_TARGET_WIDTH / this.sprite.frame.width);
  }

  private updateHitArea(): void {
    const w = this.sprite.displayWidth;
    const h = this.sprite.displayHeight;
    this.setSize(w, h);
    // Container hit-test coords are relative to the top-left of setSize(), not the
    // container's origin, so a centered sprite's full-coverage rect starts at (0,0).
    this.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
  }

  private redrawAccessories(): void {
    this.accessoryImages.forEach((img) => img.destroy());
    this.accessoryImages = [];

    const w = this.sprite.displayWidth;
    const h = this.sprite.displayHeight;
    this.accessories.forEach((id) => {
      const placement = ACCESSORY_PLACEMENT[id];
      const key = `accessory-${id}`;
      if (!placement || !this.scene.textures.exists(key)) return;

      const img = this.scene.add.image(w * placement.xFrac, h * placement.yFrac, key);
      img.setScale((w * placement.widthFrac) / img.frame.width);
      this.add(img);
      this.accessoryImages.push(img);
    });
  }

  private wireInput(): void {
    this.on('pointerdown', () => this.playTouchReaction());
  }

  private playTouchReaction(): void {
    HapticFeedback.trigger();
    this.showExpression('poke', 260);
    this.scene.tweens.add({
      targets: this,
      scaleX: 0.94,
      scaleY: 0.94,
      duration: 70,
      yoyo: true,
      ease: 'Sine.easeOut',
    });
  }

  private scheduleNextBlink(): void {
    const delay = Phaser.Math.Between(CLOUDY_CONFIG.blinkMinDelay, CLOUDY_CONFIG.blinkMaxDelay);
    this.scene.time.delayedCall(delay, () => {
      this.showExpression('sleepy', 200);
      this.scheduleNextBlink();
    });
  }

  // Swaps to a reactive pose, then reverts to idle after `revertAfterMs` —
  // a later call always wins (cancels any pending revert), so e.g. a poke
  // mid-happy-bounce correctly ends up back at idle once the poke settles.
  private showExpression(expression: Expression, revertAfterMs: number): void {
    this.sprite.setTexture(this.textureKey(expression));
    this.applySpriteScale();

    this.revertTimer?.remove();
    this.revertTimer = this.scene.time.delayedCall(revertAfterMs, () => {
      this.sprite.setTexture(this.textureKey('idle'));
      this.applySpriteScale();
    });
  }
}
