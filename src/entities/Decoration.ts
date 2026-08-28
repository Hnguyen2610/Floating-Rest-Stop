import Phaser from 'phaser';
import { PALETTE } from '../core/GameConfig';

export type DecorationVisual =
  | 'wind_chime'
  | 'rainbow_hammock'
  | 'firefly_lantern'
  | 'tea_table'
  | 'wind_pinwheel';

export class Decoration extends Phaser.GameObjects.Container {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    private visual: DecorationVisual,
    interactive: boolean,
  ) {
    super(scene, x, y);
    scene.add.existing(this);
    this.render();

    this.setScale(0);
    scene.tweens.add({ targets: this, scale: 1, duration: 300, ease: 'Back.easeOut' });

    if (interactive) this.wireInteraction();
  }

  private render(): void {
    const graphics = this.scene.add.graphics();
    switch (this.visual) {
      case 'wind_chime':
        this.drawWindChime(graphics);
        break;
      case 'rainbow_hammock':
        this.drawHammock(graphics);
        break;
      case 'firefly_lantern':
        this.drawLantern(graphics);
        break;
      case 'tea_table':
        this.drawTeaTable(graphics);
        break;
      case 'wind_pinwheel':
        this.drawPinwheel(graphics);
        break;
    }
    this.add(graphics);
  }

  private drawWindChime(g: Phaser.GameObjects.Graphics): void {
    g.lineStyle(2, PALETTE.eyeColor, 0.5);
    g.lineBetween(0, -30, 0, -10);
    g.fillStyle(PALETTE.lavender, 1);
    for (let i = -1; i <= 1; i += 1) {
      g.fillRoundedRect(i * 14 - 3, -10, 6, 26, 3);
    }
  }

  private drawHammock(g: Phaser.GameObjects.Graphics): void {
    g.lineStyle(4, PALETTE.pastelPink, 0.9);
    g.beginPath();
    g.arc(0, -10, 40, Phaser.Math.DegToRad(20), Phaser.Math.DegToRad(160), false);
    g.strokePath();
    g.fillStyle(PALETTE.eyeColor, 0.4);
    g.fillCircle(-40, -18, 4);
    g.fillCircle(40, -18, 4);
  }

  private drawLantern(g: Phaser.GameObjects.Graphics): void {
    g.fillStyle(PALETTE.softYellow, 0.9);
    g.fillCircle(0, 0, 14);
    g.lineStyle(2, PALETTE.eyeColor, 0.5);
    g.lineBetween(0, -14, 0, -26);
  }

  private drawTeaTable(g: Phaser.GameObjects.Graphics): void {
    g.fillStyle(PALETTE.cloudWhite, 1);
    g.fillEllipse(0, 0, 60, 24);
    g.fillStyle(PALETTE.mint, 0.6);
    g.fillCircle(-12, -2, 6);
    g.fillStyle(PALETTE.pastelPink, 0.6);
    g.fillCircle(12, -2, 6);
  }

  private drawPinwheel(g: Phaser.GameObjects.Graphics): void {
    const colors = [PALETTE.pastelPink, PALETTE.mint, PALETTE.softYellow, PALETTE.lavender];
    colors.forEach((color, i) => {
      const angle = (i / colors.length) * Math.PI * 2;
      g.fillStyle(color, 0.9);
      g.beginPath();
      g.moveTo(0, 0);
      g.lineTo(Math.cos(angle) * 22, Math.sin(angle) * 22);
      g.lineTo(Math.cos(angle + 0.5) * 22, Math.sin(angle + 0.5) * 22);
      g.closePath();
      g.fillPath();
    });
    g.lineStyle(2, PALETTE.eyeColor, 0.5);
    g.lineBetween(0, 22, 0, 40);
  }

  private wireInteraction(): void {
    this.setSize(60, 60);
    // Container hit-test coords are relative to the top-left of setSize(), not the
    // container's origin, so a centered circle must sit at (width/2, height/2).
    this.setInteractive(new Phaser.Geom.Circle(30, 30, 30), Phaser.Geom.Circle.Contains);
    this.on('pointerdown', () => this.playChime());
  }

  private playChime(): void {
    this.scene.tweens.add({
      targets: this,
      angle: 12,
      duration: 100,
      yoyo: true,
      repeat: 2,
      ease: 'Sine.easeInOut',
    });
    for (let i = 0; i < 3; i += 1) {
      const dot = this.scene.add.circle(this.x, this.y - 10, 3, 0xffffff, 0.9);
      this.scene.tweens.add({
        targets: dot,
        y: dot.y - 20 - i * 6,
        x: dot.x + (i - 1) * 10,
        alpha: 0,
        duration: 500,
        onComplete: () => dot.destroy(),
      });
    }
  }
}
