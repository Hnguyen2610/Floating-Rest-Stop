import Phaser from 'phaser';
import { PALETTE, FONT_FAMILY } from '../core/GameConfig';
import { eventBus } from '../core/EventBus';
import { createPanelBackground } from './PanelBackground';
import { createButtonBackground, type ButtonBackground } from './Button';
import type { DecorationSystem } from '../systems/DecorationSystem';

export class DecorationShopUI {
  private readonly panel: Phaser.GameObjects.Container;
  private backgrounds = new Map<string, ButtonBackground>();

  constructor(
    private scene: Phaser.Scene,
    x: number,
    y: number,
    private decorationSystem: DecorationSystem,
  ) {
    this.panel = scene.add.container(x, y);

    const definitions = decorationSystem.getAllDefinitions();
    const panelWidth = definitions.length * 56 + 16;
    this.panel.add(createPanelBackground(scene, panelWidth, 68));

    const startX = -(definitions.length - 1) * 28;
    definitions.forEach((def, index) => {
      const itemX = startX + index * 56;
      const item = scene.add.container(itemX, 0);

      const bg = createButtonBackground(scene, 32, 32, PALETTE.lavender);
      bg.y = -6;
      bg.setAlpha(decorationSystem.isUnlocked(def.id) ? 0.9 : 0.35);
      const label = scene.add
        .text(0, 18, String(def.cost), {
          fontFamily: FONT_FAMILY,
          fontSize: '12px',
          color: '#5b4a63',
        })
        .setOrigin(0.5);
      item.add([bg, label]);

      item.setSize(36, 36);
      // Container hit-test coords are relative to the top-left of setSize(), not the
      // container's origin, so a centered circle must sit at (width/2, height/2).
      item.setInteractive(new Phaser.Geom.Circle(18, 18, 18), Phaser.Geom.Circle.Contains);
      item.on('pointerdown', () => this.tryUnlock(def.id, bg));

      this.panel.add(item);
      this.backgrounds.set(def.id, bg);
    });

    this.panel.setVisible(false);

    const onDecorationUnlocked = ({ id }: { id: string }) => {
      this.backgrounds.get(id)?.setAlpha(0.9);
    };
    eventBus.on('decoration:unlocked', onDecorationUnlocked);
    this.panel.once(Phaser.GameObjects.Events.DESTROY, () =>
      eventBus.off('decoration:unlocked', onDecorationUnlocked),
    );
  }

  toggle(): void {
    this.panel.setVisible(!this.panel.visible);
  }

  hide(): void {
    this.panel.setVisible(false);
  }

  isOpen(): boolean {
    return this.panel.visible;
  }

  private tryUnlock(id: string, bg: ButtonBackground): void {
    if (this.decorationSystem.isUnlocked(id)) return;
    if (!this.decorationSystem.unlock(id)) {
      this.scene.tweens.add({ targets: bg, x: bg.x - 4, duration: 60, yoyo: true, repeat: 3 });
    }
  }
}
