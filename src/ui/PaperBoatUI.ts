import Phaser from 'phaser';
import { PALETTE, FONT_FAMILY, GAME_WIDTH, GAME_HEIGHT } from '../core/GameConfig';
import { createPanelBackground } from './PanelBackground';
import { createButton, createButtonBackground, createCloseButton } from './Button';
import type { PaperBoatSystem } from '../systems/PaperBoatSystem';
import type { AudioSystem } from '../systems/AudioSystem';

const PANEL_WIDTH = 360;
const PANEL_HEIGHT = 360;

export class PaperBoatUI {
  private readonly panel: Phaser.GameObjects.Container;
  private readonly messageBackgrounds = new Map<string, Phaser.GameObjects.Rectangle>();
  private readonly boatIcon: Phaser.GameObjects.Text;
  private readonly foldButton: Phaser.GameObjects.Container;
  private readonly foldButtonText: Phaser.GameObjects.Text;
  private readonly sendView: Phaser.GameObjects.Container;
  private readonly incomingView: Phaser.GameObjects.Container;
  private readonly incomingText: Phaser.GameObjects.Text;
  private readonly waitingView: Phaser.GameObjects.Container;
  private selectedMessageId: string | null = null;
  private foldStep = 0;

  constructor(
    private scene: Phaser.Scene,
    private paperBoatSystem: PaperBoatSystem,
    private audioSystem: AudioSystem,
  ) {
    this.panel = scene.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);

    this.panel.add(createPanelBackground(scene, PANEL_WIDTH, PANEL_HEIGHT));

    const title = scene.add
      .text(0, -PANEL_HEIGHT / 2 + 26, '🎐 Gửi Lời Nhắn Theo Gió', {
        fontFamily: FONT_FAMILY,
        fontSize: '16px',
        color: '#5b4a63',
      })
      .setOrigin(0.5);
    this.panel.add(title);

    this.panel.add(createCloseButton(scene, PANEL_WIDTH / 2 - 20, -PANEL_HEIGHT / 2 + 20, () => this.hide()));

    // --- "Waiting" view: nothing has arrived yet ---------------------------
    this.waitingView = scene.add.container(0, 0);
    const waitingText = scene.add
      .text(0, 0, '🌬️ Gió đang lặng...\n\nHãy tiếp tục chăm sóc các vị khách —\nmột lời nhắn sẽ sớm đến.', {
        fontFamily: FONT_FAMILY,
        fontSize: '13px',
        color: '#999999',
        align: 'center',
        lineSpacing: 6,
      })
      .setOrigin(0.5);
    this.waitingView.add(waitingText);
    this.panel.add(this.waitingView);

    // --- "Incoming" view: a kindness arrived, waiting to be read -----------
    this.incomingView = scene.add.container(0, 0);
    const incomingLabel = scene.add
      .text(0, -60, '🕊️ Một lời nhắn vừa đến', { fontFamily: FONT_FAMILY, fontSize: '14px', color: '#5b4a63' })
      .setOrigin(0.5);
    this.incomingText = scene.add
      .text(0, 0, '', {
        fontFamily: FONT_FAMILY,
        fontSize: '14px',
        color: '#5b4a63',
        align: 'center',
        wordWrap: { width: PANEL_WIDTH - 60 },
      })
      .setOrigin(0.5);
    const acknowledgeButton = createButton(
      scene,
      0,
      70,
      'Cảm ơn — giờ mình sẽ gửi một lời nhắn khác đi',
      () => this.acknowledgeIncoming(),
      { wordWrapWidth: PANEL_WIDTH - 80 },
    );
    this.incomingView.add([incomingLabel, this.incomingText, acknowledgeButton]);
    this.panel.add(this.incomingView);

    // --- "Send" view: pick a message, fold, release -------------------------
    this.sendView = scene.add.container(0, 0);
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

      this.sendView.add(row);
      this.messageBackgrounds.set(message.id, bg);
    });

    this.boatIcon = scene.add.text(0, 60, '📄', { fontSize: '40px' }).setOrigin(0.5);
    this.sendView.add(this.boatIcon);

    // Label changes 4 times as folding progresses (see advanceFold()/reset
    // below) — createButton()'s fixed-size-from-initial-label shortcut
    // doesn't fit here, so this is built manually with its own text
    // reference kept for later .setText() calls, sized to the longest of
    // the 4 labels ("Chọn một lời nhắn") up front.
    this.foldButtonText = scene.add
      .text(0, 0, 'Chọn một lời nhắn', { fontFamily: FONT_FAMILY, fontSize: '13px', color: '#ffffff' })
      .setOrigin(0.5);
    const foldButtonWidth = this.foldButtonText.width + 24;
    const foldButtonHeight = this.foldButtonText.height + 12;
    const foldButtonBg = createButtonBackground(scene, foldButtonWidth, foldButtonHeight);
    this.foldButton = scene.add.container(0, PANEL_HEIGHT / 2 - 40, [foldButtonBg, this.foldButtonText]);
    this.foldButton.setSize(foldButtonWidth, foldButtonHeight);
    // Container hit-test coords are relative to the top-left of setSize(), not the
    // container's origin, so a full-coverage rect matching setSize() starts at (0,0).
    this.foldButton.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, foldButtonWidth, foldButtonHeight),
      Phaser.Geom.Rectangle.Contains,
    );
    this.foldButton.on('pointerdown', () => this.advanceFold());
    this.sendView.add(this.foldButton);
    this.panel.add(this.sendView);

    this.panel.setVisible(false);
  }

  toggle(): void {
    this.panel.setVisible(!this.panel.visible);
    if (this.panel.visible) this.refresh();
  }

  hide(): void {
    this.panel.setVisible(false);
  }

  private refresh(): void {
    const incoming = this.paperBoatSystem.getIncoming();
    const canSend = this.paperBoatSystem.canSendNow();

    this.incomingView.setVisible(Boolean(incoming));
    this.sendView.setVisible(canSend);
    this.waitingView.setVisible(!incoming && !canSend);

    if (incoming) this.incomingText.setText(`"${incoming.text}"`);
    if (canSend) this.reset();
  }

  private acknowledgeIncoming(): void {
    this.paperBoatSystem.acknowledgeIncoming();
    this.refresh();
  }

  private selectMessage(messageId: string): void {
    this.selectedMessageId = messageId;
    this.foldStep = 0;
    this.boatIcon.setText('📄');
    this.foldButtonText.setText('Gấp góc thứ nhất');
    this.messageBackgrounds.forEach((bg, id) => bg.setFillStyle(PALETTE.lavender, id === messageId ? 0.9 : 0.4));
  }

  private advanceFold(): void {
    if (!this.selectedMessageId) return;

    this.audioSystem.playFoldSound();
    this.foldStep += 1;
    if (this.foldStep === 1) {
      this.boatIcon.setText('📃');
      this.foldButtonText.setText('Gấp góc thứ hai');
      this.playFoldPop();
    } else if (this.foldStep === 2) {
      this.boatIcon.setText('⛵');
      this.foldButtonText.setText('Thả vào gió 🌬️');
      this.playFoldPop();
    } else {
      this.release();
    }
  }

  private release(): void {
    if (!this.selectedMessageId) return;
    const messageId = this.selectedMessageId;
    this.selectedMessageId = null;

    this.playSparkle();
    this.audioSystem.playReleaseSound();
    this.scene.tweens.add({
      targets: this.boatIcon,
      x: PANEL_WIDTH / 2,
      y: this.boatIcon.y - 60,
      alpha: 0,
      duration: 700,
      ease: 'Sine.easeIn',
      onComplete: () => {
        this.paperBoatSystem.send(messageId);
        this.hide();
      },
    });
  }

  // A small punch on the boat icon so each fold step reads as a distinct
  // physical action rather than just a label/emoji swap.
  private playFoldPop(): void {
    this.boatIcon.setScale(1);
    this.scene.tweens.add({ targets: this.boatIcon, scale: 1.25, duration: 90, yoyo: true, ease: 'Sine.easeOut' });
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
    this.foldButtonText.setText('Chọn một lời nhắn');
    this.messageBackgrounds.forEach((bg) => bg.setFillStyle(PALETTE.lavender, 0.4));
  }
}
