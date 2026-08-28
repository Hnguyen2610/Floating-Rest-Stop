import Phaser from 'phaser';
import { PALETTE, FONT_FAMILY } from '../core/GameConfig';

export class GuestHintUI extends Phaser.GameObjects.Container {
  private readonly nameLabel: Phaser.GameObjects.Text;
  private readonly emotionLabel: Phaser.GameObjects.Text;
  private readonly hintLabel: Phaser.GameObjects.Text;
  private readonly panelBg: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    this.panelBg = scene.add
      .rectangle(0, 0, 340, 64, PALETTE.cloudWhite, 0.9)
      .setStrokeStyle(1, PALETTE.eyeColor, 0.25);

    this.nameLabel = scene.add
      .text(0, -19, '', { fontFamily: FONT_FAMILY, fontSize: '14px', color: '#5b4a63' })
      .setOrigin(0.5);
    this.emotionLabel = scene.add
      .text(0, 0, '', { fontFamily: FONT_FAMILY, fontSize: '11px', color: '#8a7a94' })
      .setOrigin(0.5);
    this.hintLabel = scene.add
      .text(0, 17, '', {
        fontFamily: FONT_FAMILY,
        fontSize: '10px',
        color: '#5b4a63',
        align: 'center',
        wordWrap: { width: 310 },
      })
      .setOrigin(0.5);

    this.add([this.panelBg, this.nameLabel, this.emotionLabel, this.hintLabel]);
    this.showIdle();
  }

  show(name: string, emotionLabel: string, hint: string): void {
    this.nameLabel.setText(name);
    this.emotionLabel.setText(emotionLabel);
    this.hintLabel.setText(hint);
    this.setVisible(true);
  }

  showIdle(): void {
    this.nameLabel.setText('☁️ Mây Bông');
    this.emotionLabel.setText('');
    this.hintLabel.setText('Đang chờ khách ghé thăm trạm...');
    this.setVisible(true);
  }
}
