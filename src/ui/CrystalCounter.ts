import Phaser from 'phaser';
import { PALETTE, FONT_FAMILY } from '../core/GameConfig';
import { eventBus } from '../core/EventBus';
import type { HappinessSystem } from '../systems/HappinessSystem';

export class CrystalCounter extends Phaser.GameObjects.Container {
  private readonly label: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, happinessSystem: HappinessSystem) {
    super(scene, x, y);
    scene.add.existing(this);

    const gem = scene.add.graphics();
    gem.fillStyle(PALETTE.softYellow, 1);
    gem.fillPoints(
      [
        { x: 0, y: -10 },
        { x: 7, y: -2 },
        { x: 0, y: 10 },
        { x: -7, y: -2 },
      ],
      true,
    );
    this.add(gem);

    this.label = scene.add.text(16, -10, String(happinessSystem.getCount()), {
      fontFamily: FONT_FAMILY,
      fontSize: '18px',
      color: '#5b4a63',
    });
    this.add(this.label);

    const onCollected = ({ count }: { count: number }) => this.updateCount(count);
    const onSpent = ({ count }: { count: number }) => this.updateCount(count);
    eventBus.on('happiness:collected', onCollected);
    eventBus.on('happiness:spent', onSpent);
    this.once(Phaser.GameObjects.Events.DESTROY, () => {
      eventBus.off('happiness:collected', onCollected);
      eventBus.off('happiness:spent', onSpent);
    });
  }

  private updateCount(count: number): void {
    this.label.setText(String(count));
    this.scene.tweens.add({ targets: this, scale: 1.2, duration: 120, yoyo: true });
  }
}
