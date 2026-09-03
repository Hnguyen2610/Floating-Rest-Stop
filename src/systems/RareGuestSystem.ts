import type { GuestSystem } from './GuestSystem';
import type { DecorationSystem } from './DecorationSystem';
import type { StationAreaSystem } from './StationAreaSystem';
import type { JournalSystem } from './JournalSystem';
import type { DayNightSystem } from './DayNightSystem';

const AURORA_TRUST_THRESHOLD = 40;

// Pure condition-checking — no spawning of its own. StationScene polls these
// and, when true, shows an "invite" prompt rather than auto-spawning, so a
// rare guest's arrival stays a deliberate moment the player earns.
export class RareGuestSystem {
  constructor(
    private guestSystem: GuestSystem,
    private decorationSystem: DecorationSystem,
    private stationAreaSystem: StationAreaSystem,
    private journalSystem: JournalSystem,
    private dayNightSystem: DayNightSystem,
  ) {}

  // Aurora: Moon trust cao + night station + Wind Chime + đủ Moon memories
  isAuroraAvailable(): boolean {
    const moonProgress = this.guestSystem.getProgress('moon');
    return (
      moonProgress.trustLevel >= AURORA_TRUST_THRESHOLD &&
      this.dayNightSystem.isNight() &&
      this.decorationSystem.isUnlocked('wind_chime') &&
      this.journalSystem.isUnlocked('moon_memory_3')
    );
  }

  // Comet: Little Star emotional resolution + Wind Garden unlocked + star-related memories
  isCometAvailable(): boolean {
    return (
      this.journalSystem.isUnlocked('star_memory_4') &&
      this.stationAreaSystem.isUnlocked('wind_garden')
    );
  }
}
