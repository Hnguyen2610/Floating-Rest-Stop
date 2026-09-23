import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PALETTE, FONT_FAMILY, SAFE_ZONE_MARGIN } from '../core/GameConfig';
import { getGameSystems } from '../core/GameSystems';
import { JournalSystem, type JournalChapter, type JournalItemLayout, type MemoryDefinition } from '../systems/JournalSystem';
import { createButtonBackground } from '../ui/Button';
import type { GuestSystem } from '../systems/GuestSystem';
import type { AudioSystem } from '../systems/AudioSystem';

interface StickerDefinition {
  id: string;
  name: string;
  emoji: string;
}

const STICKER_SCALE_STEPS = [0.7, 1, 1.3];

export class JournalScene extends Phaser.Scene {
  private journalSystem!: JournalSystem;
  private guestSystem!: GuestSystem;
  private audioSystem!: AudioSystem;
  private stickers: StickerDefinition[] = [];
  private editMode = false;
  private stickerPalette!: Phaser.GameObjects.Container;
  private selectionToolbar!: Phaser.GameObjects.Container;
  private placedStickers = new Map<string, Phaser.GameObjects.Text>();
  private selectedItemId: string | null = null;

  constructor() {
    super('JournalScene');
  }

  create(): void {
    const systems = getGameSystems();
    this.journalSystem = systems.journalSystem;
    this.guestSystem = systems.guestSystem;
    this.audioSystem = systems.audioSystem;
    this.stickers = (this.cache.json.get('stickers') as { stickers: StickerDefinition[] }).stickers;

    this.drawBackground();
    this.drawTitle();
    this.drawBackButton();
    this.drawChapters();
    this.drawSelectionToolbar();
    this.drawStickerPalette();
    this.drawDecorationToggle();
    this.drawStickers();

    this.cameras.main.fadeIn(300, 255, 255, 255);
    this.input.keyboard?.on('keydown-ESC', () => this.goBackToStation());
  }

  private goBackToStation(): void {
    this.cameras.main.fadeOut(300, 255, 255, 255);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start('StationScene'));
  }

  private drawBackground(): void {
    const bg = this.add.graphics();
    bg.fillGradientStyle(PALETTE.lavender, PALETTE.lavender, PALETTE.softYellow, PALETTE.softYellow, 0.5);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }

  private drawTitle(): void {
    this.add
      .text(GAME_WIDTH / 2, SAFE_ZONE_MARGIN + 16, 'Sky Journal', {
        fontFamily: FONT_FAMILY,
        fontSize: '32px',
        color: '#5b4a63',
      })
      .setOrigin(0.5);
  }

  private drawBackButton(): void {
    const button = this.add
      .text(150, SAFE_ZONE_MARGIN + 10, '← Quay lại', {
        fontFamily: FONT_FAMILY,
        fontSize: '18px',
        color: '#5b4a63',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    button.on('pointerdown', () => this.goBackToStation());
  }

  private drawChapters(): void {
    const chapters = this.journalSystem.getChapters();
    if (chapters.length === 0) return;

    // Group chapters by guest for better visual organization
    const chaptersByGuest: Record<string, JournalChapter[]> = {};
    chapters.forEach(chapter => {
      if (!chaptersByGuest[chapter.guestId]) {
        chaptersByGuest[chapter.guestId] = [];
      }
      chaptersByGuest[chapter.guestId].push(chapter);
    });

    // Each guest gets its own horizontal row (stacked vertically) so a guest
    // with several chapters has the full canvas width to lay them out across,
    // instead of every guest's chapters competing for one shared narrow column.
    // Memory cards for the first chapter sit 50px left of this anchor (their
    // own half-width, see createCard()'s `memX` for memCol 0) and are 100px
    // wide, so the true leftmost pixel is `leftMargin - 100`, not `leftMargin`
    // itself — this needs the full card width added to the safe-zone margin,
    // not just the margin alone (a plain `GAME_WIDTH * 0.1` landed at 128,
    // just inside the danger zone — confirmed by an actual crop-off first
    // card in Playwright testing, not just by re-deriving the math on paper).
    const leftMargin = SAFE_ZONE_MARGIN + 100;
    // Each guest's name header sits 55px *above* its own row anchor (see
    // `guestNameText` below) — rowStartY needs enough clearance for that
    // header to clear both the safe-zone margin and the back/title/decorate
    // buttons already occupying roughly y=80–110 near the top edge.
    const rowStartY = SAFE_ZONE_MARGIN + 120;
    const rowHeight = 230;
    const chapterSpacing = 150;

    Object.keys(chaptersByGuest).forEach((guestId, guestIndex) => {
      const guestChapters = chaptersByGuest[guestId];
      const guestDefinition = this.guestSystem.getAllDefinitions().find(g => g.id === guestId);
      const guestName = guestDefinition ? guestDefinition.name : guestId;
      const rowY = rowStartY + guestIndex * rowHeight;

      // Guest section container
      const guestSection = this.add.container(leftMargin, rowY);

      // Guest name header
      const guestNameText = this.add
        .text(0, -55, guestName, {
          fontFamily: FONT_FAMILY,
          fontSize: '20px',
          color: '#5b4a63',
        })
        .setOrigin(0, 0.5);
      guestSection.add(guestNameText);

      // Draw chapters for this guest, left to right
      guestChapters.forEach((chapter, chapterIndex) => {
        const chapterX = chapterIndex * chapterSpacing;
        const isAccessible = this.journalSystem.isChapterAccessible(chapter);
        const progress = this.getChapterProgress(chapter);
        const isComplete = progress.unlocked === progress.total;

        // Chapter container
        const chapterContainer = this.add.container(chapterX, 0);

        // Chapter title with completion indicator
        const titleColor = isComplete ? '#c8ede0' : isAccessible ? '#5b4a63' : '#999999';
        const titleText = this.add
          .text(0, -42, chapter.title, {
            fontFamily: FONT_FAMILY,
            fontSize: '12px',
            color: titleColor,
            align: 'center',
            wordWrap: { width: 135 },
          })
          .setOrigin(0.5);

        // Completion badge
        if (isComplete) {
          const badge = this.add
            .text(0, -20, 'Hoàn thành', {
              fontFamily: FONT_FAMILY,
              fontSize: '12px',
              color: '#ffffff',
              backgroundColor: '#c8ede0',
              padding: { x: 4, y: 2 },
            })
            .setOrigin(0.5);
          chapterContainer.add(badge);
        }

        // Progress indicator (dots representing memories)
        const progressDots = this.add.container(0, 0);
        const memoryCount = chapter.memories.length;
        const dotSpacing = 18;
        const startX = -(memoryCount - 1) * dotSpacing / 2;

        chapter.memories.forEach((memory, memoryIndex) => {
          const isUnlocked = this.journalSystem.isUnlocked(memory.id);
          const dotSize = isUnlocked ? 5 : 3;
          const dot = this.add.circle(
            startX + memoryIndex * dotSpacing,
            0,
            dotSize,
            isUnlocked ? PALETTE.mint : 0xd8d8d8
          );
          progressDots.add(dot);
        });

        // Lock overlay if not accessible
        if (!isAccessible) {
          const lockSize = Math.max(80, memoryCount * dotSpacing + 20);
          const lockOverlay = this.add.rectangle(0, 0, lockSize, lockSize * 0.6, 0x000000, 0.3);
          const lockIcon = this.add.text(0, 0, '🔒', {
            fontFamily: FONT_FAMILY,
            fontSize: '24px',
          }).setOrigin(0.5);
          chapterContainer.add([lockOverlay, lockIcon]);
        }

        chapterContainer.add([titleText, progressDots]);
        guestSection.add(chapterContainer);

        // Draw memories for this chapter in a grid below
        chapter.memories.forEach((memory, memoryIndex) => {
          const memCol = memoryIndex % 2;
          const memRow = Math.floor(memoryIndex / 2);
          const memX = (memCol - 0.5) * 100;

          // createCard adds directly to the scene root (not into guestSection),
          // so it needs absolute coordinates rather than guestSection-relative ones.
          this.createCard(
            leftMargin + chapterX + memX,
            rowY + 50 + memRow * 110,
            memory
          );
        });
      });

      guestSection.setSize(chapterSpacing * guestChapters.length, rowHeight);
      this.add.existing(guestSection);
    });
  }

  private getChapterProgress(chapter: JournalChapter): { unlocked: number; total: number } {
    const unlocked = chapter.memories.filter(memory =>
      this.journalSystem.isUnlocked(memory.id)
    ).length;
    return { unlocked, total: chapter.memories.length };
  }

  private createCard(
    x: number,
    y: number,
    memory: MemoryDefinition,
  ): void {
    const unlocked = this.journalSystem.isUnlocked(memory.id);
    const card = this.add.container(x, y);

    const front = this.add.container(0, 0);
    const frontColor = unlocked ? PALETTE.mint : 0xd8d8d8;
    const frontBg = createButtonBackground(this, 100, 130, frontColor);
    const frontLabel = this.add
      .text(0, 0, unlocked ? '📖' : '🔒', {
        fontFamily: FONT_FAMILY,
        fontSize: unlocked ? '20px' : '24px',
        color: '#5b4a63',
        align: 'center',
      })
      .setOrigin(0.5);
    front.add([frontBg, frontLabel]);

    const back = this.add.container(0, 0);
    const backBg = createButtonBackground(this, 100, 130, 0xfffaf0);
    const backText = this.add
      .text(0, 0, memory.diaryText, {
        fontFamily: FONT_FAMILY,
        fontSize: '11px',
        color: '#5b4a63',
        align: 'center',
        wordWrap: { width: 85 },
        lineSpacing: 2,
      })
      .setOrigin(0.5);
    back.add([backBg, backText]);
    back.setVisible(false);

    card.add([front, back]);
    card.setSize(100, 130);
    // Container hit-test coords are relative to the top-left of setSize(), not the
    // container's origin, so a centered rectangle must sit at (-width/2, -height/2).
    card.setInteractive(new Phaser.Geom.Rectangle(-50, -65, 100, 130), Phaser.Geom.Rectangle.Contains);
    card.on('pointerdown', () => {
      if (!unlocked) return;
      this.flipCard(card, front, back);
    });

    // Add hint for locked memories
    if (!unlocked && memory.hint) {
      const hintText = this.add
        .text(0, 75, memory.hint, {
          fontFamily: FONT_FAMILY,
          fontSize: '9px',
          color: '#999999',
          align: 'center',
          wordWrap: { width: 90 },
          lineSpacing: 1,
        })
        .setOrigin(0.5);
      card.add(hintText);
    }

    // Add photo moment indicator if this memory has one
    if (unlocked && memory.photoMomentId) {
      const photoIcon = this.add
        .text(35, -50, '📸', {
          fontFamily: FONT_FAMILY,
          fontSize: '16px',
        })
        .setOrigin(0.5);
      card.add(photoIcon);
    }
  }

  private flipCard(
    card: Phaser.GameObjects.Container,
    front: Phaser.GameObjects.Container,
    back: Phaser.GameObjects.Container,
  ): void {
    const showingFront = front.visible;
    this.audioSystem.playPageSound();
    this.tweens.add({
      targets: card,
      scaleX: 0,
      duration: 140,
      ease: 'Sine.easeIn',
      onComplete: () => {
        front.setVisible(!showingFront);
        back.setVisible(showingFront);
        this.tweens.add({ targets: card, scaleX: 1, duration: 140, ease: 'Sine.easeOut' });
      },
    });
  }

  // --- Journal decoration (Pass 18) ---------------------------------------

  private drawDecorationToggle(): void {
    const button = this.add
      .text(GAME_WIDTH - 140, SAFE_ZONE_MARGIN + 11, '🎀 Trang trí', {
        fontFamily: FONT_FAMILY,
        fontSize: '14px',
        color: '#5b4a63',
        backgroundColor: '#fdfbf7',
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    button.on('pointerdown', () => this.toggleEditMode());
  }

  private toggleEditMode(): void {
    this.editMode = !this.editMode;
    this.stickerPalette.setVisible(this.editMode);
    this.placedStickers.forEach((icon) => {
      if (this.editMode) icon.setInteractive({ useHandCursor: true });
      else icon.disableInteractive();
    });
    if (!this.editMode) this.deselectSticker();
  }

  private drawStickerPalette(): void {
    this.stickerPalette = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT - 110);
    this.stickerPalette.setDepth(700);

    const panelWidth = this.stickers.length * 56 + 16;
    const backdrop = this.add
      .rectangle(0, 0, panelWidth, 52, PALETTE.cloudWhite, 0.95)
      .setStrokeStyle(1, PALETTE.eyeColor, 0.25);
    this.stickerPalette.add(backdrop);

    const startX = -(this.stickers.length - 1) * 28;
    this.stickers.forEach((sticker, index) => {
      const itemX = startX + index * 56;
      const button = this.add.text(itemX, 0, sticker.emoji, { fontSize: '26px' }).setOrigin(0.5);
      button.setInteractive({ useHandCursor: true });
      button.on('pointerdown', () => this.placeSticker(sticker.id));
      this.stickerPalette.add(button);
    });

    this.stickerPalette.setVisible(false);
  }

  private drawSelectionToolbar(): void {
    this.selectionToolbar = this.add.container(0, 0);
    this.selectionToolbar.setDepth(800);

    const bg = this.add.rectangle(0, 0, 90, 28, PALETTE.cloudWhite, 0.95).setStrokeStyle(1, PALETTE.eyeColor, 0.3);
    const rotateBtn = this.add.text(-28, 0, '↻', { fontSize: '16px', color: '#5b4a63' }).setOrigin(0.5);
    const scaleBtn = this.add.text(0, 0, '⤢', { fontSize: '16px', color: '#5b4a63' }).setOrigin(0.5);
    const removeBtn = this.add.text(28, 0, '🗑', { fontSize: '14px' }).setOrigin(0.5);
    [rotateBtn, scaleBtn, removeBtn].forEach((btn) => btn.setInteractive({ useHandCursor: true }));

    rotateBtn.on('pointerdown', () => this.rotateSelected());
    scaleBtn.on('pointerdown', () => this.cycleScaleSelected());
    removeBtn.on('pointerdown', () => this.removeSelected());

    this.selectionToolbar.add([bg, rotateBtn, scaleBtn, removeBtn]);
    this.selectionToolbar.setVisible(false);
  }

  private drawStickers(): void {
    this.journalSystem.getAllJournalLayouts().forEach((layout, itemId) => {
      this.renderSticker(itemId, layout);
    });
  }

  private placeSticker(stickerType: string): void {
    const itemId = `${stickerType}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const x = GAME_WIDTH / 2;
    const y = GAME_HEIGHT / 2;
    this.journalSystem.setJournalItemLayout(itemId, stickerType, x, y, 0, 1);
    this.renderSticker(itemId, { stickerType, x, y, rotation: 0, scale: 1 }, true);
  }

  private renderSticker(itemId: string, layout: JournalItemLayout, animateIn = false): void {
    const definition = this.stickers.find((sticker) => sticker.id === layout.stickerType);
    const emoji = definition?.emoji ?? '❓';

    let icon = this.placedStickers.get(itemId);
    if (!icon) {
      icon = this.add.text(layout.x, layout.y, emoji, { fontSize: '28px' }).setOrigin(0.5);
      icon.setDepth(500);
      if (this.editMode) icon.setInteractive({ useHandCursor: true });
      this.wireStickerInteraction(itemId, icon);
      this.placedStickers.set(itemId, icon);

      // Freshly placed from the palette should feel dropped into place; a
      // sticker being restored from a save just appears as-is.
      if (animateIn) {
        icon.setScale(0);
        this.tweens.add({ targets: icon, scale: layout.scale, duration: 220, ease: 'Back.easeOut' });
        return;
      }
    }
    icon.setPosition(layout.x, layout.y);
    icon.setRotation(Phaser.Math.DegToRad(layout.rotation));
    icon.setScale(layout.scale);
  }

  private wireStickerInteraction(itemId: string, icon: Phaser.GameObjects.Text): void {
    let dragging = false;
    let moved = false;
    let offsetX = 0;
    let offsetY = 0;

    icon.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      dragging = true;
      moved = false;
      offsetX = icon.x - pointer.worldX;
      offsetY = icon.y - pointer.worldY;
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!dragging) return;
      moved = true;
      icon.setPosition(pointer.worldX + offsetX, pointer.worldY + offsetY);
    });

    this.input.on('pointerup', () => {
      if (!dragging) return;
      dragging = false;
      if (moved) this.saveStickerPosition(itemId, icon);
      else this.selectSticker(itemId, icon);
    });
  }

  private saveStickerPosition(itemId: string, icon: Phaser.GameObjects.Text): void {
    const layout = this.journalSystem.getJournalItemLayout(itemId);
    if (!layout) return;
    this.journalSystem.setJournalItemLayout(itemId, layout.stickerType, icon.x, icon.y, layout.rotation, layout.scale);
  }

  private selectSticker(itemId: string, icon: Phaser.GameObjects.Text): void {
    this.selectedItemId = itemId;
    this.selectionToolbar.setPosition(icon.x, icon.y - 36);
    this.selectionToolbar.setVisible(true);
  }

  private deselectSticker(): void {
    this.selectedItemId = null;
    this.selectionToolbar.setVisible(false);
  }

  private rotateSelected(): void {
    const layout = this.selectedItemId ? this.journalSystem.getJournalItemLayout(this.selectedItemId) : undefined;
    const icon = this.selectedItemId ? this.placedStickers.get(this.selectedItemId) : undefined;
    if (!this.selectedItemId || !layout || !icon) return;

    const rotation = (layout.rotation + 15) % 360;
    icon.setRotation(Phaser.Math.DegToRad(rotation));
    this.journalSystem.setJournalItemLayout(this.selectedItemId, layout.stickerType, layout.x, layout.y, rotation, layout.scale);
    this.selectionToolbar.setPosition(icon.x, icon.y - 36);
  }

  private cycleScaleSelected(): void {
    const layout = this.selectedItemId ? this.journalSystem.getJournalItemLayout(this.selectedItemId) : undefined;
    const icon = this.selectedItemId ? this.placedStickers.get(this.selectedItemId) : undefined;
    if (!this.selectedItemId || !layout || !icon) return;

    const currentIndex = STICKER_SCALE_STEPS.indexOf(layout.scale);
    const nextScale = STICKER_SCALE_STEPS[(currentIndex + 1) % STICKER_SCALE_STEPS.length] ?? 1;
    icon.setScale(nextScale);
    this.journalSystem.setJournalItemLayout(this.selectedItemId, layout.stickerType, layout.x, layout.y, layout.rotation, nextScale);
  }

  private removeSelected(): void {
    if (!this.selectedItemId) return;
    const icon = this.placedStickers.get(this.selectedItemId);
    icon?.destroy();
    this.placedStickers.delete(this.selectedItemId);
    this.journalSystem.removeJournalItem(this.selectedItemId);
    this.deselectSticker();
  }
}