import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PALETTE, FONT_FAMILY, SAFE_ZONE_MARGIN } from '../core/GameConfig';
import { getGameSystems, type GameSystems } from '../core/GameSystems';
import type { TutorialStep } from '../core/EventBus';

const COLUMN_TOP = 140;
const COLUMN_GAP = 20;
const SECTION_GAP = 16;
const LINE_HEIGHT = 22;
const LEFT_COLUMN = { x: SAFE_ZONE_MARGIN + 20, width: 520 };
const RIGHT_COLUMN = { x: LEFT_COLUMN.x + LEFT_COLUMN.width + COLUMN_GAP, width: 540 };
type ArchiveFilter = 'all' | 'unlocked' | 'locked';

export class SkyArchiveScene extends Phaser.Scene {
  private archiveFilter: ArchiveFilter = 'all';
  constructor() {
    super('SkyArchiveScene');
  }

  create(data: { archiveFilter?: ArchiveFilter } = {}): void {
    const systems = getGameSystems();
    this.archiveFilter = data.archiveFilter ?? 'all';
    this.drawBackground();

    // Two columns with stacked, content-sized panels — one fixed-y panel per
    // section overlapped its neighbours (and the title) as soon as the guest
    // list grew past what the layout was tuned for.
    let leftY = COLUMN_TOP;
    leftY += this.drawSection(LEFT_COLUMN, leftY, 'Những vị khách', this.guestRows(systems)) + SECTION_GAP;
    this.drawSection(LEFT_COLUMN, leftY, 'Một nơi đang lớn lên', [
      'Mỗi lượt ghé qua để lại một dấu vết.',
      'Không cần vội. Những điều nhỏ cũng được ghi nhớ.',
    ]);

    let rightY = COLUMN_TOP;
    rightY += this.drawSection(RIGHT_COLUMN, rightY, 'Những điều đã nhớ', this.memoryRows(systems)) + SECTION_GAP;
    this.drawSection(RIGHT_COLUMN, rightY, 'Trạm và Mây Bông', this.stationRows(systems));

    // Header drawn after the panels so nothing can ever cover it.
    this.add.text(GAME_WIDTH / 2, SAFE_ZONE_MARGIN + 16, 'Lưu Trữ Bầu Trời', {
      fontFamily: FONT_FAMILY,
      fontSize: '32px',
      color: '#5b4a63',
    }).setOrigin(0.5);

    const back = this.add.text(SAFE_ZONE_MARGIN + 70, SAFE_ZONE_MARGIN + 16, '← Quay lại', {
      fontFamily: FONT_FAMILY,
      fontSize: '18px',
      color: '#5b4a63',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    back.on('pointerdown', () => this.goBack());

    const filter = this.add.text(GAME_WIDTH - SAFE_ZONE_MARGIN - 80, SAFE_ZONE_MARGIN + 16, this.filterLabel(), {
      fontFamily: FONT_FAMILY,
      fontSize: '13px',
      color: '#5b4a63',
      backgroundColor: '#fdfbf7',
      padding: { x: 8, y: 5 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    filter.on('pointerdown', () => this.cycleFilter());

    this.cameras.main.fadeIn(300, 255, 255, 255);
    this.input.keyboard?.on('keydown-ESC', () => this.goBack());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown-ESC');
    });
  }

  private guestRows(systems: GameSystems): string[] {
    const rows = systems.guestSystem.getAllDefinitions().map((guest) => {
      const progress = systems.guestSystem.getProgress(guest.id);
      const memories = systems.journalSystem.getGuestUnlockedMemoriesWithDetails(guest.id).length;
      const stages = systems.guestSystem.getSeenEmotionStages(guest.id).length;
      return `${guest.name}: ${progress.visitCount} lượt ghé · ${memories} ký ức · ${stages}/5 trạng thái`;
    });
    return rows.length > 0 ? rows : ['Chưa có vị khách nào ghé qua.'];
  }

  private memoryRows(systems: GameSystems): string[] {
    const memories = systems.journalSystem.getChapters().flatMap((chapter) => chapter.memories);
    const visibleMemories = memories.filter((memory) => {
      const unlocked = systems.journalSystem.isUnlocked(memory.id);
      return this.archiveFilter === 'all' || (this.archiveFilter === 'unlocked' ? unlocked : !unlocked);
    });
    const countCategory = (category: 'cloudy' | 'world') => {
      const inCategory = memories.filter((memory) => memory.category === category);
      const unlocked = inCategory.filter((memory) => systems.journalSystem.isUnlocked(memory.id)).length;
      return `${unlocked}/${inCategory.length}`;
    };
    const recipes = systems.weatherSystem.getAllRecipes();
    const discovered = recipes.filter((recipe) => systems.weatherSystem.isRecipeDiscovered(recipe.id)).length;
    const categoryLabels = { guest: 'Khách', cloudy: 'Mây Bông', world: 'Thế giới' };
    const stageLabel = (emotion: string) => {
      try {
        return systems.emotionSystem.getEmotionMeta(emotion).label;
      } catch {
        return '';
      }
    };
    const recentSources = systems.journalSystem.getUnlockedIds().slice(-3).map((memoryId) =>
      `${categoryLabels[systems.journalSystem.getMemoryCategory(memoryId)]}: ${systems.journalSystem.getMemoryUnlockAction(memoryId, stageLabel)}`,
    );

    const filteredDetails = visibleMemories.slice(0, 3).map((memory) => {
      if (systems.journalSystem.isUnlocked(memory.id)) return `Đã mở: ${memory.diaryText}`;
      return `Chưa mở: ${memory.hint}`;
    });

    return [
      `Bộ lọc: ${this.filterLabel()}`,
      `Ký ức đã mở: ${systems.journalSystem.getUnlockedIds().length}/${memories.length}`,
      `Ký ức Mây Bông: ${countCategory('cloudy')} · Ký ức thế giới: ${countCategory('world')}`,
      `Ảnh đã chụp: ${systems.photoMomentSystem.getCapturedIds().length}`,
      `Công thức đã khám phá: ${discovered}/${recipes.length}`,
      ...(recentSources.length > 0 ? [`Dấu vết gần đây: ${recentSources.join(' · ')}`] : []),
      ...filteredDetails,
    ];
  }

  private filterLabel(): string {
    return this.archiveFilter === 'all' ? 'Tất cả' : this.archiveFilter === 'unlocked' ? 'Đã mở' : 'Chưa mở';
  }

  private cycleFilter(): void {
    const next: ArchiveFilter = this.archiveFilter === 'all'
      ? 'unlocked'
      : this.archiveFilter === 'unlocked'
        ? 'locked'
        : 'all';
    this.scene.restart({ archiveFilter: next });
  }

  private stationRows(systems: GameSystems): string[] {
    const cosmetics = systems.cloudyCosmeticsSystem;
    const unlockedCosmetics =
      cosmetics.getShapes().filter((shape) => cosmetics.isShapeUnlocked(shape.id)).length +
      cosmetics.getAccessories().filter((accessory) => cosmetics.isAccessoryUnlocked(accessory.id)).length;

    return [
      `Khu vực đã mở: ${systems.stationAreaSystem.getUnlockedIds().length}`,
      `Cosmetic đã mở: ${unlockedCosmetics}`,
      `Mưa Sao Băng: ${systems.rareWeatherSystem.isCompleted('meteor_shower') ? 'đã chứng kiến' : 'chưa chứng kiến'}`,
      `Tiến trình chào đón: ${this.tutorialLabel(systems.tutorialSystem.getStep())}`,
    ];
  }

  private drawBackground(): void {
    const background = this.add.graphics();
    background.fillGradientStyle(PALETTE.skyTop, PALETTE.skyTop, PALETTE.lavender, PALETTE.lavender, 1);
    background.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    background.setDepth(-2);
  }

  /** Draws one panel sized to its content and returns its height. */
  private drawSection(column: { x: number; width: number }, y: number, title: string, lines: string[]): number {
    const titleText = this.add.text(column.x + 24, y + 12, title, {
      fontFamily: FONT_FAMILY,
      fontSize: '17px',
      color: '#5b4a63',
    });
    const lineTexts = lines.map((line) => this.add.text(column.x + 34, 0, `• ${line}`, {
      fontFamily: FONT_FAMILY,
      fontSize: '13px',
      color: '#74677d',
      wordWrap: { width: column.width - 60 },
    }));
    const contentHeight = lineTexts.reduce((total, text) => total + Math.max(LINE_HEIGHT, text.height + 4), 0);
    const height = 52 + contentHeight;
    const panel = this.add.graphics();
    panel.fillStyle(PALETTE.cloudWhite, 0.9);
    panel.fillRoundedRect(column.x, y, column.width, height, 14);
    panel.lineStyle(2, PALETTE.eyeColor, 0.16);
    panel.strokeRoundedRect(column.x, y, column.width, height, 14);
    panel.setDepth(-1);
    let lineY = y + 44;
    lineTexts.forEach((text) => {
      text.setY(lineY);
      lineY += Math.max(LINE_HEIGHT, text.height + 4);
    });
    titleText.setDepth(0);
    return height;
  }

  private tutorialLabel(step: TutorialStep): string {
    const labels: Record<TutorialStep, string> = {
      WAITING_FOR_GUEST: 'đang chờ khách',
      FIND_INGREDIENT: 'đang quan sát',
      CRAFT_WEATHER: 'đang pha chế',
      DELIVER_WEATHER: 'đang chăm sóc',
      RUB_GUEST: 'đang vuốt ve',
      WATCH_EMOTION: 'đang lắng nghe',
      COMPLETE: 'đã hoàn thành lượt đầu',
    };
    return labels[step];
  }

  private goBack(): void {
    this.cameras.main.fadeOut(300, 255, 255, 255);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start('StationScene'));
  }
}
