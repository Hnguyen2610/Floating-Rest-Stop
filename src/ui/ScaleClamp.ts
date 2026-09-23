import Phaser from 'phaser';

// Phaser.Scale.ENVELOP crops whichever axis overflows the parent element —
// safe (every control stays reachable, per the 80px SAFE_ZONE_MARGIN budget
// in docs/superpowers/specs/2026-09-18-fullscreen-responsive-design.md) only
// within a bounded aspect-ratio range. Verified by real Playwright testing:
// an iPad-landscape viewport (ratio 1.33) crops ~160px per side — double the
// 80px budget — and loses entire buttons off-screen, not just their padding.
// Phaser has no built-in "envelop up to a max crop, then letterbox" mode, so
// this clamps the #app *parent element* itself to the ratio range where an
// 80px-per-side crop is never exceeded — ENVELOP still fills that (now-
// bounded) parent exactly as designed, and the browser shows a small
// background-color bar outside it only in these out-of-range cases, the
// same idea as the old FIT letterbox but far narrower.
//
// Both bounds solve crop_per_side(ratio) = 80 for the two crop directions
// (see the spec's formulas): narrower than ~1.56 crops left/right past
// budget, wider than ~2.2 crops top/bottom past budget.
const MIN_RATIO = 1.56;
const MAX_RATIO = 2.2;

export function installScaleClamp(game: Phaser.Game, appEl: HTMLElement): void {
  const apply = (): void => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const ratio = vw / vh;

    let width = vw;
    let height = vh;
    if (ratio > MAX_RATIO) {
      width = vh * MAX_RATIO;
    } else if (ratio < MIN_RATIO) {
      height = vw / MIN_RATIO;
    }

    appEl.style.width = `${width}px`;
    appEl.style.height = `${height}px`;
    game.scale.refresh();
  };

  window.addEventListener('resize', apply);
  window.addEventListener('orientationchange', apply);
  apply();
}
