/**
 * Best-effort vibration feedback on devices/browsers that support the
 * Vibration API — a no-op everywhere else (desktop, iOS Safari, etc.), so
 * every call site can fire it unconditionally without feature-checking.
 * Kept to short, subtle taps only, matching this game's "no pressure, no
 * insistent feedback" direction — not used for every interaction, just the
 * ones a real tap on a physical object would plausibly nudge back at you.
 */
export class HapticFeedback {
  static trigger(durationMs = 15): void {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(durationMs);
    }
  }
}
