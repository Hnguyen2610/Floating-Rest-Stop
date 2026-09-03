import Phaser from 'phaser';
import { PALETTE, FONT_FAMILY } from '../core/GameConfig';
import { eventBus } from '../core/EventBus';
import type { CloudyCosmeticsSystem } from '../systems/CloudyCosmeticsSystem';

const ROW_WIDTH = 220;

export class CloudyCosmeticsShopUI {
  private readonly panel: Phaser.GameObjects.Container;
  private shapeBackgrounds = new Map<string, Phaser.GameObjects.Rectangle>();
  private accessoryBackgrounds = new Map<string, Phaser.GameObjects.Rectangle>();

  constructor(
    private scene: Phaser.Scene,
    x: number,
    y: number,
    private cosmeticsSystem: CloudyCosmeticsSystem,
    private onChanged: () => void,
  ) {
    this.panel = scene.add.container(x, y);

    const shapes = cosmeticsSystem.getShapes();
    const accessories = cosmeticsSystem.getAccessories();
    const rowCount = shapes.length + accessories.length + 2; // +2 for the two section titles
    const panelHeight = rowCount * 26 + 16;

    const backdrop = scene.add
      .rectangle(0, 0, ROW_WIDTH + 16, panelHeight, PALETTE.cloudWhite, 0.96)
      .setStrokeStyle(1, PALETTE.eyeColor, 0.25);
    this.panel.add(backdrop);

    let rowY = -panelHeight / 2 + 16;

    rowY = this.addSectionTitle('Hình Dạng Mây Bông', rowY);
    shapes.forEach((shape) => {
      const bg = this.addRow(
        rowY,
        shape.name,
        () => this.describeShapeCost(shape.id),
        () => this.tryShape(shape.id),
      );
      this.shapeBackgrounds.set(shape.id, bg);
      rowY += 26;
    });

    rowY = this.addSectionTitle('Phụ Kiện', rowY);
    accessories.forEach((accessory) => {
      const bg = this.addRow(
        rowY,
        accessory.name,
        () => (this.cosmeticsSystem.isAccessoryUnlocked(accessory.id) ? 'Đang có' : 'Chưa có'),
        () => this.tryAccessory(accessory.id),
      );
      this.accessoryBackgrounds.set(accessory.id, bg);
      rowY += 26;
    });

    this.refreshAll();
    this.panel.setVisible(false);

    const onCosmeticUnlocked = () => this.refreshAll();
    eventBus.on('cloudyCosmetic:unlocked', onCosmeticUnlocked);
    this.panel.once(Phaser.GameObjects.Events.DESTROY, () =>
      eventBus.off('cloudyCosmetic:unlocked', onCosmeticUnlocked),
    );
  }

  toggle(): void {
    this.panel.setVisible(!this.panel.visible);
  }

  hide(): void {
    this.panel.setVisible(false);
  }

  private addSectionTitle(text: string, rowY: number): number {
    const title = this.scene.add
      .text(0, rowY, text, { fontFamily: FONT_FAMILY, fontSize: '12px', color: '#5b4a63' })
      .setOrigin(0.5);
    this.panel.add(title);
    return rowY + 22;
  }

  private addRow(
    rowY: number,
    name: string,
    describeStatus: () => string,
    onTap: () => void,
  ): Phaser.GameObjects.Rectangle {
    const row = this.scene.add.container(0, rowY);
    const bg = this.scene.add
      .rectangle(0, 0, ROW_WIDTH, 22, PALETTE.lavender, 0.4)
      .setStrokeStyle(1, PALETTE.eyeColor, 0.2);
    const label = this.scene.add
      .text(-ROW_WIDTH / 2 + 8, 0, name, { fontFamily: FONT_FAMILY, fontSize: '11px', color: '#5b4a63' })
      .setOrigin(0, 0.5);
    const status = this.scene.add
      .text(ROW_WIDTH / 2 - 8, 0, describeStatus(), { fontFamily: FONT_FAMILY, fontSize: '10px', color: '#5b4a63' })
      .setOrigin(1, 0.5)
      .setName('status');
    row.add([bg, label, status]);

    row.setSize(ROW_WIDTH, 22);
    row.setInteractive(new Phaser.Geom.Rectangle(-ROW_WIDTH / 2, -11, ROW_WIDTH, 22), Phaser.Geom.Rectangle.Contains);
    row.on('pointerdown', onTap);

    this.panel.add(row);
    return bg;
  }

  private describeShapeCost(id: string): string {
    if (this.cosmeticsSystem.getEquippedShape() === id) return 'Đang dùng';
    if (this.cosmeticsSystem.isShapeUnlocked(id)) return 'Đã mở';
    const def = this.cosmeticsSystem.getShapes().find((shape) => shape.id === id);
    return def?.cost !== undefined ? `💎 ${def.cost}` : 'Chưa có';
  }

  private tryShape(id: string): void {
    if (!this.cosmeticsSystem.isShapeUnlocked(id)) {
      if (!this.cosmeticsSystem.purchaseShape(id)) {
        this.refreshAll();
        return;
      }
    }
    // Tapping an owned (or freshly bought) shape wears it immediately —
    // buying shouldn't need a second tap to actually put it on.
    this.cosmeticsSystem.equipShape(id);
    this.refreshAll();
    this.onChanged();
  }

  private tryAccessory(id: string): void {
    this.cosmeticsSystem.toggleAccessory(id);
    this.refreshAll();
    this.onChanged();
  }

  private refreshAll(): void {
    this.shapeBackgrounds.forEach((bg, id) => {
      const equipped = this.cosmeticsSystem.getEquippedShape() === id;
      bg.setFillStyle(PALETTE.lavender, equipped ? 0.95 : this.cosmeticsSystem.isShapeUnlocked(id) ? 0.55 : 0.35);
      this.updateStatusLabel(bg, this.describeShapeCost(id));
    });
    this.accessoryBackgrounds.forEach((bg, id) => {
      const equipped = this.cosmeticsSystem.getEquippedAccessories().includes(id);
      bg.setFillStyle(PALETTE.lavender, equipped ? 0.95 : this.cosmeticsSystem.isAccessoryUnlocked(id) ? 0.55 : 0.35);
      const label = this.cosmeticsSystem.isAccessoryUnlocked(id) ? (equipped ? 'Đang đeo' : 'Đã mở') : 'Chưa có';
      this.updateStatusLabel(bg, label);
    });
  }

  private updateStatusLabel(bg: Phaser.GameObjects.Rectangle, text: string): void {
    const row = bg.parentContainer;
    const status = row?.getByName('status') as Phaser.GameObjects.Text | null;
    status?.setText(text);
  }
}
