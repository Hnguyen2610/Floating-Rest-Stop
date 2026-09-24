import type { TypedEventBus, GameEventMap } from '../core/EventBus';
import type { GuestSystem } from './GuestSystem';
import type { StationAreaSystem } from './StationAreaSystem';
import type { DayNightSystem } from './DayNightSystem';
import type { JournalSystem } from './JournalSystem';
import type { RareWeatherSaveState } from '../services/save/SaveProvider';

export interface RareWeatherEventDefinition {
  id: string;
  name: string;
  requiredAreaId: string;
  requiredGuestId: string;
  requiredVisitCount: number;
  visualEffect: string;
  memoryId: string;
  photoMomentId?: string;
  recipeId?: string;
}

export interface RareWeatherData {
  events: RareWeatherEventDefinition[];
}

export class RareWeatherSystem {
  private completed = new Set<string>();
  private lastCompletedVisitCounts = new Map<string, number>();
  private active: string | null = null;

  constructor(
    private data: RareWeatherData,
    private stationAreaSystem: StationAreaSystem,
    private guestSystem: GuestSystem,
    private dayNightSystem: DayNightSystem,
    private journalSystem: JournalSystem,
    private eventBus: TypedEventBus<GameEventMap>,
  ) {}

  getEvents(): RareWeatherEventDefinition[] {
    return this.data.events;
  }

  getActiveEvent(): RareWeatherEventDefinition | null {
    return this.data.events.find((event) => event.id === this.active) ?? null;
  }

  canStart(eventId: string): boolean {
    const event = this.data.events.find((candidate) => candidate.id === eventId);
    if (!event || this.active) return false;
    const progress = this.guestSystem.getProgress(event.requiredGuestId);
    return this.dayNightSystem.isNight()
      && !this.guestSystem.getCurrentGuest()
      && this.stationAreaSystem.isUnlocked(event.requiredAreaId)
      && progress.visitCount >= event.requiredVisitCount
      && progress.visitCount > (this.lastCompletedVisitCounts.get(eventId) ?? -1);
  }

  start(eventId: string): boolean {
    if (!this.canStart(eventId)) return false;
    this.active = eventId;
    this.eventBus.emit('rareWeather:started', { eventId });
    return true;
  }

  completeActive(): void {
    if (!this.active) return;
    const eventId = this.active;
    const event = this.data.events.find((candidate) => candidate.id === eventId);
    this.active = null;
    this.completed.add(eventId);
    if (event) {
      this.lastCompletedVisitCounts.set(
        eventId,
        this.guestSystem.getProgress(event.requiredGuestId).visitCount,
      );
    }
    if (event && !this.journalSystem.isUnlocked(event.memoryId)) {
      this.journalSystem.unlockMemory(event.memoryId);
    }
    this.eventBus.emit('rareWeather:completed', { eventId });
  }

  // For when the scene driving the event is torn down mid-animation (e.g. the
  // player opens the Journal within its ~2s run): the completion timer lives
  // on the scene and dies with it, so without this the active event would stay
  // set for the rest of the session and could never start again.
  cancelActive(): void {
    this.active = null;
  }

  isCompleted(eventId: string): boolean {
    return this.completed.has(eventId);
  }

  getSaveState(): RareWeatherSaveState {
    const lastCompletedVisitCounts = Object.fromEntries(this.lastCompletedVisitCounts);
    return Object.keys(lastCompletedVisitCounts).length > 0
      ? { completedEventIds: [...this.completed], lastCompletedVisitCounts }
      : { completedEventIds: [...this.completed] };
  }

  restoreState(state: RareWeatherSaveState | undefined): void {
    this.completed = new Set(state?.completedEventIds ?? []);
    this.lastCompletedVisitCounts = new Map(Object.entries(state?.lastCompletedVisitCounts ?? {}));
    for (const eventId of this.completed) {
      if (this.lastCompletedVisitCounts.has(eventId)) continue;
      const event = this.data.events.find((candidate) => candidate.id === eventId);
      if (event) this.lastCompletedVisitCounts.set(eventId, event.requiredVisitCount);
    }
  }
}
