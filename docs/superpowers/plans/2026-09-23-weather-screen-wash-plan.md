# Weather Screen Wash Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a brief, subtle full-screen color wash (~500ms fade in/out) synced to each of the 5 existing per-recipe weather particle effects (`ParticleEffect.createWeatherEffect`, added in "Đợt 4" per `src/Plan.md`), so a successful potion delivery reads as a small whole-screen moment, not just a burst of particles at the guest's position.

**Architecture:** A new one-shot static method, `ParticleEffect.createScreenWash(scene, visualEffect)`, following the exact same style already used by every other method in that file (a single `Phaser.GameObjects.Rectangle` covering the full screen, faded in then out via `scene.tweens.chain`, then destroyed in `onComplete` — no persistent state, no new class, matching `createSparkleEffect`'s create-fire-and-forget-destroy shape). It reuses the existing `VFX_TINT` palette (already tuned in "Đợt 4" specifically because pastel `PALETTE` tones proved invisible against the sky) so wash colors match each effect's particle tint exactly. Called from the same success branch in `StationScene.handleGuestInteraction()` that already calls `createWeatherEffect`, right next to it — not merged into `createWeatherEffect` itself, since the wash needs no `x`/`y` (it's full-screen) and keeping it a separate call keeps each method's job single-purpose.

**Tech Stack:** Phaser 3.90 (`Phaser.GameObjects.Rectangle`, `scene.tweens.chain`), TypeScript.

## Global Constraints

- No new texture assets, no shader — this is a plain `Rectangle` with a tweened `alpha`, which is why it carries no performance risk on low-end devices (unlike the postFX plan's vignette/bloom, this needs no WebGL-specific capability and works identically on the Canvas2D fallback).
- Reuse `VFX_TINT` from `src/utils/ParticleEffect.ts` — do not introduce a second color palette for the same 5 effects.
- Do not run `git commit` at any point in this plan unless the user asks for it in this session.

---

### Task 1: `ParticleEffect.createScreenWash()`

**Files:**
- Modify: `src/utils/ParticleEffect.ts`

**Interfaces:**
- Consumes: `GAME_WIDTH`, `GAME_HEIGHT` from `../core/GameConfig` (not currently imported in this file).
- Produces: `static createScreenWash(scene: Phaser.Scene, visualEffect: string): void`, consumed by Task 2.

- [ ] **Step 1: Add the GameConfig import**

At the top of `src/utils/ParticleEffect.ts` (currently just `import Phaser from 'phaser';` at line 1), add:

```ts
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../core/GameConfig';
```

- [ ] **Step 2: Add a wash-color lookup next to the existing `VFX_TINT`**

Right after the `VFX_TINT` constant (currently lines 20-25), add:

```ts
// Screen-wash tint per recipe, reusing VFX_TINT so the full-screen flash
// matches each effect's particle color exactly. Aurora's particles use two
// overlapping tints (purple + green) — the wash picks moonPurple alone
// rather than trying to blend both, since a two-color full-screen wash
// would read as muddy rather than as two distinct hues.
const WASH_TINT: Record<string, number> = {
  drizzle: VFX_TINT.waterBlue,
  starlight: VFX_TINT.moonPurple,
  breeze: VFX_TINT.leafGreen,
  aurora: VFX_TINT.moonPurple,
  comet: VFX_TINT.emberOrange,
};
```

- [ ] **Step 3: Add `createScreenWash`**

Add this method inside the `ParticleEffect` class, right after `createWeatherEffect` (currently ends at line 85, right before the "Cool Drizzle" comment block):

```ts
  /**
   * Brief full-screen color wash synced to a successful recipe delivery —
   * called alongside createWeatherEffect (same visualEffect string), not
   * merged into it, since this needs no x/y. Unknown visualEffect values
   * get no wash at all (createWeatherEffect already has its own generic
   * sparkle fallback for that case; a full-screen flash isn't worth
   * guessing a color for an effect this method doesn't recognize).
   */
  static createScreenWash(scene: Phaser.Scene, visualEffect: string): void {
    const color = WASH_TINT[visualEffect];
    if (color === undefined) return;

    const wash = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, color, 0);
    // Depth 400: above every default-depth (0) game-world object — sky,
    // platform, Cloudy, guests, particles — but below every UI panel/button,
    // which all sit at 500+ (see PanelBackground/RecipeBookUI/WelcomeGuideUI
    // etc.) — the wash tints the "world" without dimming any UI chrome.
    wash.setDepth(400);
    scene.tweens.chain({
      targets: wash,
      tweens: [
        { alpha: 0.12, duration: 150, ease: 'Sine.easeOut' },
        { alpha: 0, duration: 350, ease: 'Sine.easeIn' },
      ],
      onComplete: () => wash.destroy(),
    });
  }
```

- [ ] **Step 4: Typecheck, lint, test**

Run: `npx tsc --noEmit && npx eslint . && npx vitest run`
Expected: all clean.

---

### Task 2: Wire it into the successful-delivery path

**Files:**
- Modify: `src/scenes/StationScene.ts:645-658` (inside `handleGuestInteraction`)

**Interfaces:**
- Consumes: `ParticleEffect.createScreenWash(scene: Phaser.Scene, visualEffect: string): void` (Task 1).
- Produces: nothing new consumed elsewhere.

- [ ] **Step 1: Call it right next to the existing `createWeatherEffect` call**

In `src/scenes/StationScene.ts`, inside the `potionId === treatment.recipeId` branch of `handleGuestInteraction` (currently lines 645-658 — if the squash-stretch plan's Task 1 has already been applied, this is the same block that also now calls `this.cloudy.playHappyBounce()`; add this line regardless of whether that plan ran first):

```ts
      if (potionId === treatment.recipeId) {
        const recipe = this.systems.weatherSystem.getRecipe(potionId);
        this.systems.guestSystem.soothe(recipe.soothingValue);
        // Each recipe gets its own flourish (RecipeDefinition.visualEffect —
        // previously unused, every recipe played the same generic sparkle).
        if (this.activeGuestEntity) {
          ParticleEffect.createWeatherEffect(
            this,
            this.activeGuestEntity.x,
            this.activeGuestEntity.y,
            recipe.visualEffect,
          );
        }
        ParticleEffect.createScreenWash(this, recipe.visualEffect);
      }
```

(This snippet omits the `else`/`playRejectShake()` branch and the trailing `this.cloudy.playHappyBounce()` call from the squash-stretch plan for clarity — if that plan already ran, keep those lines exactly as they are and just add the `createScreenWash` line shown above in the same spot.)

- [ ] **Step 2: Typecheck, lint, test**

Run: `npx tsc --noEmit && npx eslint . && npx vitest run`
Expected: all clean.

- [ ] **Step 3: Visual check with the dev server**

With `npm run dev` running, brew and deliver each of the 5 recipes in turn (dev keys `1`-`6` spawn guests per `StationScene.ts`'s debug key block; brew via the mixer UI or the `Z`/`V`/`X` debug shortcuts already in place). For each delivery, confirm:
- A brief, subtle whole-screen color wash appears and fades within roughly half a second, matching that recipe's particle tint (blue/purple/green/purple/orange).
- The wash never meaningfully obscures UI panels (mixer, HUD icons, buttons) — it should sit visibly *behind* them.
- The rub/direct-soothe interaction (Bé Sao Nhút Nhát) does **not** get a wash — it uses `createSparkleEffect`, a separate code path this plan doesn't touch.
- No console errors, no leftover full-screen rectangle stuck on screen after repeated deliveries (confirms `onComplete: () => wash.destroy()` is actually firing).

- [ ] **Step 4: Report status**

Summarize to the user: all checks passing, screen wash confirmed working for all 5 recipes, nothing committed unless asked.

---

## Self-Review Notes

- **Spec coverage:** the approved item — a brief full-screen wash tied to each weather effect — is fully covered (Task 1 implementation, Task 2 wiring).
- **Placeholder scan:** no TBD/TODO; every step has complete, runnable code.
- **Type consistency:** `createScreenWash(scene: Phaser.Scene, visualEffect: string): void` (Task 1) matches its call site `ParticleEffect.createScreenWash(this, recipe.visualEffect)` (Task 2) — `recipe.visualEffect` is typed `string` on `RecipeDefinition` (`src/systems/WeatherSystem.ts`), same as the existing `createWeatherEffect(scene, x, y, visualEffect: string)` call directly above it.
