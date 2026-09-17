import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, FONT_FAMILY } from '../core/GameConfig';
import { eventBus } from '../core/EventBus';

/**
 * Surfaces a save problem only when one actually happens (`save:failed`) —
 * a successful autosave (which fires after nearly every action: collecting
 * a crystal, a guest leaving, unlocking a decoration...) stays silent by
 * design. A "Saving.../Saved!" toast on every one of those would be exactly
 * the kind of nagging feedback this game's "Subtle > Flashy, no pressure"
 * direction rules out — the player only needs to know when something is
 * actually wrong.
 */
export class SaveStatusUI {
  private readonly container: Phaser.GameObjects.Container;
  private readonly text: Phaser.GameObjects.Text;
  private hideTimer: Phaser.Time.TimerEvent | null = null;
  private readonly handleSaveFailed = (): void => this.showFailure();

  constructor(private scene: Phaser.Scene) {
    this.container = scene.add.container(GAME_WIDTH / 2, GAME_HEIGHT - 40);
    this.container.setDepth(1000);

    this.text = scene.add
      .text(0, 0, '💾 Chưa lưu được — sẽ thử lại', {
        fontFamily: FONT_FAMILY,
        fontSize: '14px',
        color: '#5b4a63',
        backgroundColor: '#fdfbf7',
        padding: { x: 12, y: 6 },
      })
      .setOrigin(0.5);
    this.container.add(this.text);
    this.container.setVisible(false);

    eventBus.on('save:failed', this.handleSaveFailed);
    this.container.once(Phaser.GameObjects.Events.DESTROY, () => {
      eventBus.off('save:failed', this.handleSaveFailed);
      this.hideTimer?.remove();
    });
  }

  private showFailure(): void {
    this.container.setVisible(true);
    this.hideTimer?.remove();
    this.hideTimer = this.scene.time.delayedCall(3000, () => this.container.setVisible(false));
  }

  destroy(): void {
    this.container.destroy();
  }
}
