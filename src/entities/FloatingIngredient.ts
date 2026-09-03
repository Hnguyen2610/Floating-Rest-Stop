import Phaser from 'phaser';
import { FONT_FAMILY } from '../core/GameConfig';
import type { IngredientDefinition } from '../systems/IngredientSystem';

const ICON_TARGET_WIDTH = 46;

export class FloatingIngredient extends Phaser.GameObjects.Container {
  private idleTime = Math.random() * Math.PI * 2;
  private readonly baseX: number;
  private readonly baseY: number;
  private dragging = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    public readonly definition: IngredientDefinition,
    private onDropped: (ingredient: FloatingIngredient, screenX: number, screenY: number) => void,
  ) {
    super(scene, x, y);
    this.baseX = x;
    this.baseY = y;
    scene.add.existing(this);

    // Illustrated sprite (glossy orb + glyph + shadow are already baked into
    // the art) — scaled by width so it stays proportional regardless of each
    // source image's exact crop dimensions.
    const icon = scene.add.image(0, 0, `ingredient-${definition.id}`);
    icon.setScale(ICON_TARGET_WIDTH / icon.width);
    this.add(icon);

    const label = scene.add
      .text(0, 24, definition.name, {
        fontFamily: FONT_FAMILY,
        fontSize: '11px',
        color: '#5b4a63',
      })
      .setOrigin(0.5)
      .setAlpha(0.85);
    this.add(label);

    this.setSize(48, 48);
    // Container hit-test coords are relative to the top-left of setSize(), not the
    // container's origin, so a centered circle must sit at (width/2, height/2).
    this.setInteractive(new Phaser.Geom.Circle(24, 24, 24), Phaser.Geom.Circle.Contains);
    this.wireInput();
  }

  update(_time: number, delta: number): void {
    if (this.dragging) return;
    this.idleTime += delta / 1000;
    this.x = this.baseX + Math.sin(this.idleTime * 1.6) * 10;
    this.y = this.baseY + Math.cos(this.idleTime * 1.2) * 8;
  }

  private readonly handlePointerMove = (pointer: Phaser.Input.Pointer): void => {
    if (!this.dragging) return;
    this.x = pointer.worldX;
    this.y = pointer.worldY;
  };

  private readonly handlePointerUp = (pointer: Phaser.Input.Pointer): void => {
    if (!this.dragging) return;
    this.dragging = false;
    this.onDropped(this, pointer.worldX, pointer.worldY);
  };

  // A quick pop-and-fade so a drop reads as "landed" rather than just
  // vanishing — called by the scene right before destroying this ingredient.
  playLanded(onComplete: () => void): void {
    this.disableInteractive();
    this.scene.tweens.add({
      targets: this,
      scale: 1.4,
      alpha: 0,
      duration: 180,
      ease: 'Sine.easeOut',
      onComplete,
    });
  }

  private wireInput(): void {
    this.on('pointerdown', () => {
      this.dragging = true;
      this.scene.tweens.add({ targets: this, scale: 1.15, duration: 80 });
    });
    this.scene.input.on('pointermove', this.handlePointerMove);
    this.scene.input.on('pointerup', this.handlePointerUp);
    this.once(Phaser.GameObjects.Events.DESTROY, () => {
      this.scene.input.off('pointermove', this.handlePointerMove);
      this.scene.input.off('pointerup', this.handlePointerUp);
    });
  }
}
