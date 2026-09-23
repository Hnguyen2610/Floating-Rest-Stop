import type { TypedEventBus, GameEventMap } from '../core/EventBus';
import type { SaveData, SaveProvider, GuestSaveEntry } from '../services/save/SaveProvider';
import type { HappinessSystem } from './HappinessSystem';
import type { StationAreaSystem } from './StationAreaSystem';
import type { DecorationSystem } from './DecorationSystem';
import type { GuestSystem } from './GuestSystem';
import type { JournalSystem } from './JournalSystem';
import type { PhotoMomentSystem } from './PhotoMomentSystem';
import type { PaperBoatSystem } from './PaperBoatSystem';
import type { CloudyCosmeticsSystem } from './CloudyCosmeticsSystem';
import type { TutorialSystem } from './TutorialSystem';
import type { AudioSystem } from './AudioSystem';

const SAVE_DATA_VERSION = 1;
const AUTOSAVE_DEBOUNCE_MS = 1000;

export interface SaveableSystems {
  happinessSystem: HappinessSystem;
  stationAreaSystem: StationAreaSystem;
  decorationSystem: DecorationSystem;
  guestSystem: GuestSystem;
  journalSystem: JournalSystem;
  photoMomentSystem: PhotoMomentSystem;
  paperBoatSystem: PaperBoatSystem;
  cloudyCosmeticsSystem: CloudyCosmeticsSystem;
  tutorialSystem: TutorialSystem;
  audioSystem: AudioSystem;
}

export class SaveSystem {
  private readonly ready: Promise<void>;
  private autosaveTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private provider: SaveProvider,
    private systems: SaveableSystems,
    private eventBus: TypedEventBus<GameEventMap>,
  ) {
    this.ready = this.initialize();
    this.wireAutosave();
  }

  private async initialize(): Promise<void> {
    const data = await this.provider.load();
    if (data) this.applyToSystems(data);
  }

  whenReady(): Promise<void> {
    return this.ready;
  }

  async saveNow(): Promise<void> {
    await this.ready;
    this.eventBus.emit('save:started', undefined);
    try {
      await this.provider.save(this.gatherFromSystems());
      this.eventBus.emit('save:completed', undefined);
    } catch (error) {
      this.eventBus.emit('save:failed', undefined);
      throw error;
    }
  }

  private wireAutosave(): void {
    const trigger = () => this.scheduleAutosave();
    this.eventBus.on('happiness:collected', trigger);
    this.eventBus.on('happiness:spent', trigger);
    this.eventBus.on('decoration:unlocked', trigger);
    this.eventBus.on('memory:unlocked', trigger);
    this.eventBus.on('guest:left', trigger);
    this.eventBus.on('journal:layout-updated', trigger);
    this.eventBus.on('journal:item-removed', trigger);
    this.eventBus.on('paperboat:sent', trigger);
    this.eventBus.on('area:unlocked', trigger);
    this.eventBus.on('cloudyCosmetic:unlocked', trigger);
    this.eventBus.on('tutorial:seen', trigger);
  }

  private scheduleAutosave(): void {
    if (this.autosaveTimer) clearTimeout(this.autosaveTimer);
    this.autosaveTimer = setTimeout(() => {
      // Best-effort: a failed autosave write shouldn't crash the game.
      this.saveNow().catch(() => undefined);
    }, AUTOSAVE_DEBOUNCE_MS);
  }

  private gatherFromSystems(): SaveData {
    const guestProgress: Record<string, GuestSaveEntry> = {};
    for (const def of this.systems.guestSystem.getAllDefinitions()) {
      const progress = this.systems.guestSystem.getProgress(def.id);
      guestProgress[def.id] = {
        ...progress,
        memoryProgress: [...progress.memoryProgress.entries()],
      };
    }

    return {
      version: SAVE_DATA_VERSION,
      happinessCrystals: this.systems.happinessSystem.getCount(),
      unlockedDecorations: this.systems.decorationSystem.getUnlockedIds(),
      guestProgress,
      unlockedMemories: this.systems.journalSystem.getUnlockedIds(),
      capturedPhotoMoments: this.systems.photoMomentSystem.getCapturedIds(),
      journalLayout: [...this.systems.journalSystem.getAllJournalLayouts().entries()],
      paperBoat: this.systems.paperBoatSystem.getSaveState(),
      unlockedAreas: this.systems.stationAreaSystem.getUnlockedIds(),
      cloudyCosmetics: this.systems.cloudyCosmeticsSystem.getSaveState(),
      hasSeenTutorial: this.systems.tutorialSystem.hasSeenWelcome(),
      audioSettings: this.systems.audioSystem.getSettingsSave(),
    };
  }

  private applyToSystems(data: SaveData): void {
    this.systems.happinessSystem.restoreCount(data.happinessCrystals);
    this.systems.stationAreaSystem.restoreUnlocked(data.unlockedAreas ?? []);
    this.systems.decorationSystem.restoreUnlocked(data.unlockedDecorations);
    this.systems.journalSystem.restoreUnlocked(data.unlockedMemories);
    this.systems.photoMomentSystem.restoreCaptured(data.capturedPhotoMoments);
    this.systems.journalSystem.restoreJournalLayouts(data.journalLayout ?? []);
    this.systems.paperBoatSystem.restoreState(
      data.paperBoat ?? { sentCount: 0, incomingMessageId: null, canSend: false },
    );
    if (data.cloudyCosmetics) this.systems.cloudyCosmeticsSystem.restoreState(data.cloudyCosmetics);
    this.systems.tutorialSystem.restoreHasSeenWelcome(data.hasSeenTutorial ?? false);
    this.systems.audioSystem.restoreSettings(data.audioSettings);
    for (const [guestId, progress] of Object.entries(data.guestProgress)) {
      this.systems.guestSystem.restoreProgress(guestId, {
        ...progress,
        memoryProgress: new Map(progress.memoryProgress),
      });
    }
  }
}
