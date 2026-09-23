import Phaser from 'phaser';
import { PALETTE, FONT_FAMILY } from '../core/GameConfig';
import { eventBus } from '../core/EventBus';
import type { HappinessSystem } from '../systems/HappinessSystem';

// Same texture as the flying HappinessCrystal collect animation (Pass "visual
// upgrade" #2) — this persistent counter used to fall back to its own
// separate procedural diamond even after that swap, so the crystal looked
// right mid-flight but reverted to the old placeholder the moment it landed.
const TEXTURE_KEY = 'collectible-happiness-crystal';
const TARGET_WIDTH = 22;

export class CrystalCounter extends Phaser.GameObjects.Container {
  private readonly label: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, happinessSystem: HappinessSystem) {
    super(scene, x, y);
    scene.add.existing(this);

    if (scene.textures.exists(TEXTURE_KEY)) {
      const image = scene.add.image(0, 0, TEXTURE_KEY);
      image.setScale(TARGET_WIDTH / image.frame.width);
      this.add(image);
    } else {
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
    }

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
