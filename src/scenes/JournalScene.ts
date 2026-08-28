import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PALETTE, FONT_FAMILY } from '../core/GameConfig';
import { getGameSystems } from '../core/GameSystems';
import { JournalSystem, type JournalChapter, type MemoryDefinition } from '../systems/JournalSystem';

export class JournalScene extends Phaser.Scene {
  private journalSystem!: JournalSystem;

  constructor() {
    super('JournalScene');
  }

  create(): void {
    this.journalSystem = getGameSystems().journalSystem;

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
    const chapterWidth = GAME_WIDTH / chapters.length;

    chapters.forEach((chapter, index) => {
      const chapterX = chapterWidth * index + chapterWidth / 2;
      this.add
        .text(chapterX, GAME_HEIGHT * 0.28, chapter.guestName, {
          fontFamily: FONT_FAMILY,
          fontSize: '22px',
          color: '#5b4a63',
          align: 'center',
        })
        .setOrigin(0.5);

      chapter.memories.forEach((memory, memoryIndex) => {
        this.createCard(chapterX, GAME_HEIGHT * 0.55 + memoryIndex * 210, chapter, memory);
      });
    });
  }

  private createCard(
    x: number,
    y: number,
    chapter: JournalChapter,
    memory: MemoryDefinition,
  ): void {
    const unlocked = this.journalSystem.isUnlocked(memory.id);
    const card = this.add.container(x, y);

    const front = this.add.container(0, 0);
    const frontColor = unlocked ? PALETTE.mint : 0xd8d8d8;
    const frontBg = this.add.rectangle(0, 0, 150, 190, frontColor, 1).setStrokeStyle(2, 0x5b4a63, 0.3);
    const frontLabel = this.add
      .text(0, 0, unlocked ? chapter.guestName : '🔒', {
        fontFamily: FONT_FAMILY,
        fontSize: unlocked ? '16px' : '28px',
        color: '#5b4a63',
        align: 'center',
        wordWrap: { width: 120 },
      })
      .setOrigin(0.5);
    front.add([frontBg, frontLabel]);

    const back = this.add.container(0, 0);
    const backBg = this.add.rectangle(0, 0, 150, 190, 0xfffaf0, 1).setStrokeStyle(2, 0x5b4a63, 0.3);
    const backText = this.add
      .text(0, 0, memory.diaryText, {
        fontFamily: FONT_FAMILY,
        fontSize: '13px',
        color: '#5b4a63',
        align: 'center',
        wordWrap: { width: 130 },
      })
      .setOrigin(0.5);
    back.add([backBg, backText]);
    back.setVisible(false);

    card.add([front, back]);
    card.setSize(150, 190);
    card.setInteractive();
    card.on('pointerdown', () => {
      if (!unlocked) return;
      this.flipCard(card, front, back);
    });
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
