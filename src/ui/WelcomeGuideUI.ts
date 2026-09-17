import Phaser from 'phaser';
import { PALETTE, FONT_FAMILY, GAME_WIDTH, GAME_HEIGHT } from '../core/GameConfig';

const PANEL_WIDTH = 420;
const PANEL_HEIGHT = 420;

const BODY_TEXT = [
  '☁️ Đây là Mây Bông, người bạn nhỏ của trạm.',
  '',
  'Thỉnh thoảng sẽ có khách ghé qua — đọc ô chữ cạnh khách để biết họ đang cần gì.',
  '',
  'Kéo 2 nguyên liệu đúng vào bát trộn rồi bấm CHẾ TẠO, sau đó chạm nhẹ vào khách để đưa món vừa pha. Không nhớ công thức? Bấm 📖 cạnh bát trộn bất cứ lúc nào.',
  '',
  'Không có điểm số, không giới hạn thời gian — cứ từ từ nhé 🌸',
].join('\n');

// First-launch onboarding (shown once, see TutorialSystem) plus a reusable
// "❓" help panel — same Container-toggle pattern as RecipeBookUI, but with
// fixed copy instead of a data-driven list since there's nothing to iterate.
export class WelcomeGuideUI {
  private readonly panel: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, private onDismiss: () => void) {
    this.panel = scene.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    this.panel.setDepth(1000);

    const backdrop = scene.add
      .rectangle(0, 0, PANEL_WIDTH, PANEL_HEIGHT, PALETTE.cloudWhite, 0.97)
      .setStrokeStyle(2, PALETTE.eyeColor, 0.3);
    this.panel.add(backdrop);

    const title = scene.add
      .text(0, -PANEL_HEIGHT / 2 + 30, '👋 Chào mừng đến Trạm Dừng Chân', {
        fontFamily: FONT_FAMILY,
        fontSize: '16px',
        color: '#5b4a63',
        align: 'center',
        wordWrap: { width: PANEL_WIDTH - 60 },
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
    closeButton.on('pointerdown', () => this.dismiss());
    this.panel.add(closeButton);

    const body = scene.add
      .text(0, -20, BODY_TEXT, {
        fontFamily: FONT_FAMILY,
        fontSize: '12px',
        color: '#5b4a63',
        align: 'center',
        lineSpacing: 6,
        wordWrap: { width: PANEL_WIDTH - 64 },
      })
      .setOrigin(0.5, 0.5);
    this.panel.add(body);

    const startButton = scene.add
      .text(0, PANEL_HEIGHT / 2 - 34, 'Bắt đầu thôi!', {
        fontFamily: FONT_FAMILY,
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: '#8b7355',
        padding: { x: 16, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    startButton.on('pointerdown', () => this.dismiss());
    this.panel.add(startButton);

    this.panel.setVisible(false);
  }

  private dismiss(): void {
    this.panel.setVisible(false);
    this.onDismiss();
  }

  show(): void {
    this.panel.setVisible(true);
  }

  hide(): void {
    this.panel.setVisible(false);
  }
}
