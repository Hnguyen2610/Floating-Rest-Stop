import type { TypedEventBus, GameEventMap, TutorialStep } from '../core/EventBus';
import type { TutorialStepSave } from '../services/save/SaveProvider';

// Tracks whether the player has dismissed the first-launch welcome guide —
// persisted through the same SaveProvider as everything else (not raw
// localStorage) so it works correctly on YouTube Playables too, which has
// its own storage mechanism behind that same abstraction.
export class TutorialSystem {
  private seen = false;
  private step: TutorialStep = 'WAITING_FOR_GUEST';

  // treatmentTypeOf lets the tutorial tell a potion guest from a rub-only one
  // (Bé Sao has no recipe): sending her through find-ingredient/craft/deliver
  // would teach steps that can never happen for her.
  constructor(
    private eventBus: TypedEventBus<GameEventMap>,
    private treatmentTypeOf?: (guestId: string) => 'recipe' | 'direct' | undefined,
  ) {
    eventBus.on('guest:arrived', (guest) => {
      const rubOnly = this.treatmentTypeOf?.(guest.id) === 'direct';
      this.advanceFrom('WAITING_FOR_GUEST', rubOnly ? 'RUB_GUEST' : 'FIND_INGREDIENT');
    });
    eventBus.on('ingredient:collected', () => this.advanceFrom('FIND_INGREDIENT', 'CRAFT_WEATHER'));
    eventBus.on('weather:created', () => this.advanceFrom('CRAFT_WEATHER', 'DELIVER_WEATHER'));
    // guest:emotion-changed only fires when a guest is actually soothed, so a
    // wrong potion (weather:used with no soothe) correctly leaves the step at
    // DELIVER_WEATHER instead of claiming the player already saw a reaction.
    eventBus.on('guest:emotion-changed', () => {
      this.advanceFrom('DELIVER_WEATHER', 'WATCH_EMOTION');
      this.advanceFrom('RUB_GUEST', 'WATCH_EMOTION');
    });
    eventBus.on('guest:relaxed', () => this.advanceFrom('WATCH_EMOTION', 'COMPLETE'));
  }

  hasSeenWelcome(): boolean {
    return this.seen;
  }

  markWelcomeSeen(): void {
    if (this.seen) return;
    this.seen = true;
    this.eventBus.emit('tutorial:seen', undefined);
    this.eventBus.emit('tutorial:step-changed', { step: this.step });
  }

  getStep(): TutorialStep {
    return this.step;
  }

  // A save that has seen the welcome guide but predates step-tracking (or lost
  // it) belongs to a returning player — starting them at WAITING_FOR_GUEST would
  // replay the whole first-session tutorial over a game they already know.
  //
  // The guest and the brewed potion are not saved, so a reload in the middle of
  // the first visit cannot resume it: a step that expects a guest/potion would
  // show hints for things that no longer exist (and, once past FIND_INGREDIENT,
  // never advance). Mid-visit steps restart at the next guest; a reload while
  // only watching the guest calm down counts as finished.
  restoreHasSeenWelcome(seen: boolean, step?: TutorialStepSave): void {
    this.seen = seen;
    if (!seen) {
      this.step = 'WAITING_FOR_GUEST';
      return;
    }
    const saved = step ?? 'COMPLETE';
    this.step = saved === 'WATCH_EMOTION' ? 'COMPLETE'
      : saved === 'COMPLETE' ? 'COMPLETE'
        : 'WAITING_FOR_GUEST';
  }

  private advanceFrom(expected: TutorialStep, next: TutorialStep): void {
    if (!this.seen || this.step !== expected) return;
    this.step = next;
    this.eventBus.emit('tutorial:step-changed', { step: next });
  }
}
