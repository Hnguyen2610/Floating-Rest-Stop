import Phaser from 'phaser';
import { PALETTE, FONT_FAMILY } from '../core/GameConfig';
import { eventBus } from '../core/EventBus';
import { createPanelBackground } from './PanelBackground';
import { createButtonBackground, type ButtonBackground } from './Button';
import type { StationAreaSystem } from '../systems/StationAreaSystem';

export class StationAreaShopUI {
  private readonly panel: Phaser.GameObjects.Container;
  private backgrounds = new Map<string, ButtonBackground>();

  constructor(
    private scene: Phaser.Scene,
    x: number,
    y: number,
    private stationAreaSystem: StationAreaSystem,
  ) {
    this.panel = scene.add.container(x, y);

    const definitions = stationAreaSystem.getAllDefinitions();
    const rowWidth = 200;
    this.panel.add(createPanelBackground(scene, rowWidth + 16, definitions.length * 30 + 40));

    const title = scene.add
      .text(0, -(definitions.length * 30) / 2 - 8, '🗺️ Mở Rộng Trạm', {
        fontFamily: FONT_FAMILY,
        fontSize: '13px',
        color: '#5b4a63',
      })
      .setOrigin(0.5);
    this.panel.add(title);

    definitions.forEach((def, index) => {
      const rowY = -(definitions.length - 1) * 15 + index * 30 + 14;
      const row = scene.add.container(0, rowY);

      const bg = createButtonBackground(scene, rowWidth, 24, PALETTE.lavender);
      bg.setAlpha(stationAreaSystem.isUnlocked(def.id) ? 0.9 : 0.35);
      const label = scene.add
        .text(-rowWidth / 2 + 8, 0, def.name, {
          fontFamily: FONT_FAMILY,
          fontSize: '11px',
          color: '#5b4a63',
        })
        .setOrigin(0, 0.5);
      const cost = scene.add
        .text(rowWidth / 2 - 8, 0, def.cost === 0 ? 'Có sẵn' : `💎 ${def.cost}`, {
          fontFamily: FONT_FAMILY,
          fontSize: '11px',
          color: '#5b4a63',
        })
        .setOrigin(1, 0.5);
      row.add([bg, label, cost]);

      row.setSize(rowWidth, 24);
      row.setInteractive(new Phaser.Geom.Rectangle(-rowWidth / 2, -12, rowWidth, 24), Phaser.Geom.Rectangle.Contains);
      row.on('pointerdown', () => this.tryUnlock(def.id, bg));

      this.panel.add(row);
      this.backgrounds.set(def.id, bg);
    });

    this.panel.setVisible(false);

    const onAreaUnlocked = ({ id }: { id: string }) => {
      this.backgrounds.get(id)?.setAlpha(0.9);
    };
    eventBus.on('area:unlocked', onAreaUnlocked);
    this.panel.once(Phaser.GameObjects.Events.DESTROY, () => eventBus.off('area:unlocked', onAreaUnlocked));
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
    if (this.stationAreaSystem.isUnlocked(id)) return;
    if (!this.stationAreaSystem.unlock(id)) {
      this.scene.tweens.add({ targets: bg, x: bg.x - 4, duration: 60, yoyo: true, repeat: 3 });
    }
  }
}
