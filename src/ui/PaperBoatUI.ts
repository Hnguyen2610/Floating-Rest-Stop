import Phaser from 'phaser';
import { PALETTE, FONT_FAMILY, GAME_WIDTH, GAME_HEIGHT } from '../core/GameConfig';
import type { PaperBoatSystem } from '../systems/PaperBoatSystem';

const PANEL_WIDTH = 360;
const PANEL_HEIGHT = 360;

export class PaperBoatUI {
  private readonly panel: Phaser.GameObjects.Container;
  private readonly messageBackgrounds = new Map<string, Phaser.GameObjects.Rectangle>();
  private readonly boatIcon: Phaser.GameObjects.Text;
  private readonly foldButton: Phaser.GameObjects.Text;
  private selectedMessageId: string | null = null;
  private foldStep = 0;

  constructor(
    private scene: Phaser.Scene,
    private paperBoatSystem: PaperBoatSystem,
    private onSent: () => void,
  ) {
    this.panel = scene.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);

    const backdrop = scene.add
      .rectangle(0, 0, PANEL_WIDTH, PANEL_HEIGHT, PALETTE.cloudWhite, 0.97)
      .setStrokeStyle(2, PALETTE.eyeColor, 0.3);
    this.panel.add(backdrop);

    const title = scene.add
      .text(0, -PANEL_HEIGHT / 2 + 26, '🎐 Gửi Lời Nhắn Theo Gió', {
        fontFamily: FONT_FAMILY,
        fontSize: '16px',
        color: '#5b4a63',
      })
      .setOrigin(0.5);
    this.panel.add(title);

    const closeButton = scene.add
      .text(PANEL_WIDTH / 2 - 20, -PANEL_HEIGHT / 2 + 20, '✕', {
        fontFamily: FONT_FAMILY,
        fontSize: '18px',
        color: '#5b4a63',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    closeButton.on('pointerdown', () => this.hide());
    this.panel.add(closeButton);

    paperBoatSystem.getMessages().forEach((message, index) => {
      const rowY = -PANEL_HEIGHT / 2 + 60 + index * 40;
      const row = scene.add.container(0, rowY);
      const bg = scene.add
        .rectangle(0, 0, PANEL_WIDTH - 40, 32, PALETTE.lavender, 0.4)
        .setStrokeStyle(1, PALETTE.eyeColor, 0.2);
      const text = scene.add
        .text(0, 0, message.text, {
          fontFamily: FONT_FAMILY,
          fontSize: '12px',
          color: '#5b4a63',
          align: 'center',
          wordWrap: { width: PANEL_WIDTH - 60 },
        })
        .setOrigin(0.5);
      row.add([bg, text]);

      row.setSize(PANEL_WIDTH - 40, 32);
      // Container hit-test coords are relative to the top-left of setSize(), not the
      // container's origin, so a centered rectangle must sit at (-width/2, -height/2).
      row.setInteractive(
        new Phaser.Geom.Rectangle(-(PANEL_WIDTH - 40) / 2, -16, PANEL_WIDTH - 40, 32),
        Phaser.Geom.Rectangle.Contains,
      );
      row.on('pointerdown', () => this.selectMessage(message.id));

      this.panel.add(row);
      this.messageBackgrounds.set(message.id, bg);
    });

    this.boatIcon = scene.add.text(0, 60, '📄', { fontSize: '40px' }).setOrigin(0.5);
    this.panel.add(this.boatIcon);

    this.foldButton = scene.add
      .text(0, PANEL_HEIGHT / 2 - 40, 'Chọn một lời nhắn', {
        fontFamily: FONT_FAMILY,
        fontSize: '13px',
        color: '#ffffff',
        backgroundColor: '#8b7355',
        padding: { x: 12, y: 6 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    this.foldButton.on('pointerdown', () => this.advanceFold());
    this.panel.add(this.foldButton);

    this.panel.setVisible(false);
  }

  toggle(): void {
    this.panel.setVisible(!this.panel.visible);
    if (this.panel.visible) this.reset();
  }

  hide(): void {
    this.panel.setVisible(false);
  }

  private selectMessage(messageId: string): void {
    this.selectedMessageId = messageId;
    this.foldStep = 0;
    this.boatIcon.setText('📄');
    this.foldButton.setText('Gấp góc thứ nhất');
    this.messageBackgrounds.forEach((bg, id) => bg.setFillStyle(PALETTE.lavender, id === messageId ? 0.9 : 0.4));
  }

  private advanceFold(): void {
    if (!this.selectedMessageId) return;

    this.foldStep += 1;
    if (this.foldStep === 1) {
      this.boatIcon.setText('📃');
      this.foldButton.setText('Gấp góc thứ hai');
    } else if (this.foldStep === 2) {
      this.boatIcon.setText('⛵');
      this.foldButton.setText('Thả vào gió 🌬️');
    } else {
      this.release();
    }
  }

  private release(): void {
    if (!this.selectedMessageId) return;
    const messageId = this.selectedMessageId;
    this.selectedMessageId = null;

    this.playSparkle();
    this.scene.tweens.add({
      targets: this.boatIcon,
      x: PANEL_WIDTH / 2,
      y: this.boatIcon.y - 60,
      alpha: 0,
      duration: 700,
      ease: 'Sine.easeIn',
      onComplete: () => {
        this.paperBoatSystem.send(messageId);
        this.onSent();
        this.hide();
      },
    });
  }

  // A little flourish around the boat as it leaves — purely decorative
  // ("special sparkle" reward flavor from the design brief), no gameplay effect.
  private playSparkle(): void {
    const origin = { x: this.boatIcon.x, y: this.boatIcon.y };
    for (let i = 0; i < 5; i += 1) {
      const angle = (i / 5) * Math.PI * 2;
      const sparkle = this.scene.add
        .text(origin.x, origin.y, '✨', { fontSize: '14px' })
        .setOrigin(0.5)
        .setDepth(950);
      this.panel.add(sparkle);
      this.scene.tweens.add({
        targets: sparkle,
        x: origin.x + Math.cos(angle) * 40,
        y: origin.y + Math.sin(angle) * 40,
        alpha: 0,
        duration: 500,
        ease: 'Sine.easeOut',
        onComplete: () => sparkle.destroy(),
      });
    }
  }

  private reset(): void {
    this.selectedMessageId = null;
    this.foldStep = 0;
    this.boatIcon.setText('📄').setPosition(0, 60).setAlpha(1);
    this.foldButton.setText('Chọn một lời nhắn');
    this.messageBackgrounds.forEach((bg) => bg.setFillStyle(PALETTE.lavender, 0.4));
  }
}
