import Phaser from 'phaser';
import { FONT_FAMILY, BIRDS_CONFIG } from '../core/GameConfig';
import { createPanelBackground } from './PanelBackground';

export class GuestHintUI extends Phaser.GameObjects.Container {
  private readonly nameLabel: Phaser.GameObjects.Text;
  private readonly emotionLabel: Phaser.GameObjects.Text;
  private readonly actionLabel: Phaser.GameObjects.Text;
  private readonly hintLabel: Phaser.GameObjects.Text;
  private readonly panelBg: Phaser.GameObjects.GameObject;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);
    // Ambient birds/fireflies sit at BIRDS_CONFIG.depth and fly through this
    // panel's screen area — the hint text must stay readable above them.
    this.setDepth(BIRDS_CONFIG.depth + 1);

    this.panelBg = createPanelBackground(scene, 340, 94);

    this.nameLabel = scene.add
      .text(0, -34, '', { fontFamily: FONT_FAMILY, fontSize: '14px', color: '#5b4a63' })
      .setOrigin(0.5);
    this.emotionLabel = scene.add
      .text(0, -15, '', { fontFamily: FONT_FAMILY, fontSize: '11px', color: '#8a7a94' })
      .setOrigin(0.5);
    this.actionLabel = scene.add
      .text(0, 4, '', {
        fontFamily: FONT_FAMILY,
        fontSize: '10px',
        color: '#5b4a63',
        align: 'center',
        wordWrap: { width: 310 },
      })
      .setOrigin(0.5);
    this.hintLabel = scene.add
      .text(0, 27, '', {
        fontFamily: FONT_FAMILY,
        fontSize: '10px',
        color: '#5b4a63',
        align: 'center',
        wordWrap: { width: 310 },
      })
      .setOrigin(0.5);

    this.add([this.panelBg, this.nameLabel, this.emotionLabel, this.actionLabel, this.hintLabel]);
    this.showIdle();
  }

  show(
    name: string,
    emotionLabel: string,
    progressLabel: string,
    actionLabel: string,
    hint: string,
    color = '#8a7a94',
  ): void {
    this.nameLabel.setText(name);
    this.emotionLabel.setText(`Tình trạng: ${emotionLabel}  •  ${progressLabel}`);
    this.emotionLabel.setColor(color);
    this.actionLabel.setText(actionLabel);
    this.hintLabel.setText(hint);
    this.setVisible(true);
  }

  showIdle(): void {
    this.nameLabel.setText('☁️ Mây Bông');
    this.emotionLabel.setText('Tình trạng: chờ khách');
    this.emotionLabel.setColor('#8a7a94');
    this.actionLabel.setText('Việc tiếp theo: chờ một vị khách ghé qua');
    this.hintLabel.setText('Đang chờ khách ghé thăm trạm...');
    this.setVisible(true);
  }
}
