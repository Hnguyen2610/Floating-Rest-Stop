import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PALETTE, FONT_FAMILY } from '../core/GameConfig';
import { getGameSystems } from '../core/GameSystems';
import { JournalSystem, type JournalChapter, type MemoryDefinition } from '../systems/JournalSystem';
import type { GuestSystem } from '../systems/GuestSystem';

export class JournalScene extends Phaser.Scene {
  private journalSystem!: JournalSystem;
  private guestSystem!: GuestSystem;

  constructor() {
    super('JournalScene');
  }

  create(): void {
    const systems = getGameSystems();
    this.journalSystem = systems.journalSystem;
    this.guestSystem = systems.guestSystem;

    this.drawBackground();
    this.drawTitle();
    this.drawBackButton();
    this.drawChapters();
  }

  private drawBackground(): void {
    const bg = this.add.graphics();
    bg.fillGradientStyle(PALETTE.lavender, PALETTE.lavender, PALETTE.softYellow, PALETTE.softYellow, 0.5);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }

  private drawTitle(): void {
    this.add
      .text(GAME_WIDTH / 2, 48, 'Sky Journal', {
        fontFamily: FONT_FAMILY,
        fontSize: '32px',
        color: '#5b4a63',
      })
      .setOrigin(0.5);
  }

  private drawBackButton(): void {
    const button = this.add
      .text(90, 40, '← Quay lại', {
        fontFamily: FONT_FAMILY,
        fontSize: '18px',
        color: '#5b4a63',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    button.on('pointerdown', () => this.scene.start('StationScene'));
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
    const leftMargin = GAME_WIDTH * 0.1;
    const rowStartY = GAME_HEIGHT * 0.16;
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
    const frontBg = this.add.rectangle(0, 0, 100, 130, frontColor, 1).setStrokeStyle(2, 0x5b4a63, 0.3);
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
    const backBg = this.add.rectangle(0, 0, 100, 130, 0xfffaf0, 1).setStrokeStyle(2, 0x5b4a63, 0.3);
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
}