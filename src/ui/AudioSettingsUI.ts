import Phaser from 'phaser';
import { PALETTE, FONT_FAMILY } from '../core/GameConfig';
import type { AudioSystem, AudioBus } from '../systems/AudioSystem';

const PANEL_WIDTH = 260;
const TRACK_WIDTH = 160;
const TRACK_HEIGHT = 10;

interface SliderRow {
  getValue: () => number;
  setValue: (value: number) => void;
  track: Phaser.GameObjects.Rectangle;
  fill: Phaser.GameObjects.Rectangle;
}

export class AudioSettingsUI {
  private readonly panel: Phaser.GameObjects.Container;
  private readonly sliders: SliderRow[] = [];
  private muteLabel!: Phaser.GameObjects.Text;

  constructor(
    private scene: Phaser.Scene,
    x: number,
    y: number,
    private audioSystem: AudioSystem,
  ) {
    this.panel = scene.add.container(x, y);

    const rows: Array<{ label: string; getValue: () => number; setValue: (v: number) => void }> = [
      { label: 'Tổng', getValue: () => audioSystem.getMasterVolume(), setValue: (v) => audioSystem.setMasterVolume(v) },
      { label: 'Nhạc nền', getValue: () => audioSystem.getBusVolume('music'), setValue: (v) => audioSystem.setBusVolume('music', v) },
      { label: 'Không gian', getValue: () => audioSystem.getBusVolume('ambience'), setValue: (v) => audioSystem.setBusVolume('ambience', v) },
      { label: 'Hiệu ứng', getValue: () => audioSystem.getBusVolume('sfx'), setValue: (v) => audioSystem.setBusVolume('sfx', v) },
    ];
    const panelHeight = rows.length * 34 + 60;

    const backdrop = scene.add
      .rectangle(0, 0, PANEL_WIDTH, panelHeight, PALETTE.cloudWhite, 0.97)
      .setStrokeStyle(1, PALETTE.eyeColor, 0.25);
    this.panel.add(backdrop);

    const title = scene.add
      .text(0, -panelHeight / 2 + 18, '🔊 Âm Thanh', { fontFamily: FONT_FAMILY, fontSize: '13px', color: '#5b4a63' })
      .setOrigin(0.5);
    this.panel.add(title);

    rows.forEach((row, index) => {
      const rowY = -panelHeight / 2 + 44 + index * 34;
      this.sliders.push(this.addSlider(row.label, rowY, row.getValue, row.setValue));
    });

    const muteRowY = panelHeight / 2 - 22;
    const muteButton = scene.add
      .text(0, muteRowY, '', { fontFamily: FONT_FAMILY, fontSize: '12px', color: '#5b4a63', backgroundColor: '#fdfbf7', padding: { x: 10, y: 4 } })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    this.muteLabel = muteButton;
    this.refreshMuteLabel();
    muteButton.on('pointerdown', () => {
      audioSystem.setMuted(!audioSystem.isMuted());
      this.refreshMuteLabel();
    });
    this.panel.add(muteButton);

    this.panel.setVisible(false);
  }

  toggle(): void {
    this.panel.setVisible(!this.panel.visible);
    if (this.panel.visible) this.refreshSliders();
  }

  hide(): void {
    this.panel.setVisible(false);
  }

  private addSlider(
    label: string,
    rowY: number,
    getValue: () => number,
    setValue: (value: number) => void,
  ): SliderRow {
    const labelText = this.scene.add
      .text(-PANEL_WIDTH / 2 + 12, rowY, label, { fontFamily: FONT_FAMILY, fontSize: '11px', color: '#5b4a63' })
      .setOrigin(0, 0.5);
    this.panel.add(labelText);

    const trackX = PANEL_WIDTH / 2 - TRACK_WIDTH - 12;
    const track = this.scene.add
      .rectangle(trackX, rowY, TRACK_WIDTH, TRACK_HEIGHT, PALETTE.lavender, 0.4)
      .setStrokeStyle(1, PALETTE.eyeColor, 0.2)
      .setOrigin(0, 0.5);
    const fill = this.scene.add
      .rectangle(trackX, rowY, TRACK_WIDTH * getValue(), TRACK_HEIGHT, PALETTE.mint, 0.9)
      .setOrigin(0, 0.5);
    this.panel.add([track, fill]);

    const hitArea = this.scene.add.rectangle(trackX + TRACK_WIDTH / 2, rowY, TRACK_WIDTH, 24, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });
    this.panel.add(hitArea);

    const applyFromPointerX = (pointerX: number) => {
      const local = Phaser.Math.Clamp((pointerX - (this.panel.x + trackX)) / TRACK_WIDTH, 0, 1);
      setValue(local);
      fill.width = TRACK_WIDTH * local;
    };

    // Same manual drag pattern used elsewhere in this codebase (Cloudy,
    // LittleStarGuest) rather than Phaser's built-in draggable, which needs
    // scene.input.setDraggable() wiring this UI doesn't otherwise use.
    let dragging = false;
    hitArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      dragging = true;
      applyFromPointerX(pointer.worldX);
    });
    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!dragging) return;
      applyFromPointerX(pointer.worldX);
    });
    this.scene.input.on('pointerup', () => {
      dragging = false;
    });

    return { getValue, setValue, track, fill };
  }

  private refreshSliders(): void {
    this.sliders.forEach((slider) => {
      slider.fill.width = TRACK_WIDTH * slider.getValue();
    });
    this.refreshMuteLabel();
  }

  private refreshMuteLabel(): void {
    this.muteLabel.setText(this.audioSystem.isMuted() ? '🔇 Đang tắt tiếng' : '🔊 Đang bật tiếng');
  }
}

export type { AudioBus };
