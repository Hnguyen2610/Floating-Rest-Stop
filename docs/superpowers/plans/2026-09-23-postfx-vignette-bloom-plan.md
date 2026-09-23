# Post-Processing (Vignette + Bloom) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a subtle full-screen vignette for mood, and a subtle glow (bloom) on Cloudy specifically — using Phaser 3.90's built-in FX pipeline, which this codebase has never used before (confirmed: zero `postFX`/`preFX` matches anywhere in `src/`).

**Architecture:** Phaser 3.90 ships two separate FX surfaces: **camera-level** FX (`camera.postFX.addXxx()`, applies to everything the camera renders, including UI) and **GameObject-level** FX (`gameObject.postFX.addXxx()`, applies to just that one object). Vignette goes on the **camera** (`this.cameras.main`) — it's meant to darken the screen edges globally, and it's a single cheap shader pass. Bloom goes on **Cloudy's sprite specifically** (`this.sprite`, not the whole `Cloudy` container) — applying bloom camera-wide would also blur/glow every UI text label and icon, hurting readability, and bloom is multi-pass (several blur iterations) so scoping it to one small object keeps the cost bounded. Both are guarded behind a `this.game.renderer.type === Phaser.WEBGL` check (`Phaser.Scene` has no `renderer` property of its own — it's reached via the Scene's `game: Phaser.Game` reference, or `this.scene.game` from a plain `GameObject` that only has a `scene` reference): this game uses `Phaser.AUTO` (`src/core/Game.ts:14`), which falls back to Canvas2D on devices/WebViews that can't do WebGL, and the FX pipeline requires WebGL — the guard keeps the game working identically (just without the effect) on that fallback path instead of relying on unverified silent-no-op behavior.

**Tech Stack:** Phaser 3.90's `postFX` GameObject/Camera FX pipeline (`Vignette`, `Bloom`), TypeScript.

## Global Constraints

- This project targets YouTube Playables embedding (`vite.config.ts`'s `build:playables` mode, injects the Playables SDK) — a constrained in-app WebView profile, and there is currently no FPS-adaptive quality system (`src/utils/PerformanceMonitor.ts` is an opt-in debug-only FPS counter, not a throttle). Keep both effects subtle and bounded in scope (camera-wide vignette is cheap; bloom is scoped to one small object, not the whole screen) per this constraint.
- Every `postFX`/`preFX` call must be behind a `this.game.renderer.type === Phaser.WEBGL` guard from inside a `Scene` (`this.game` — Scene's own property), or `this.scene.game.renderer.type === Phaser.WEBGL` from inside a plain `GameObject`/`Container` (only has `this.scene`, not `this.game`) — never assume WebGL is available.
- Config constants live in `src/core/GameConfig.ts` alongside `CLOUDY_CONFIG`/`SHADOW_CONFIG`/etc., exported `as const`.
- Do not run `git commit` at any point in this plan unless the user asks for it in this session.

---

### Task 1: Config + camera-wide vignette

**Files:**
- Modify: `src/core/GameConfig.ts` (append `POST_FX_CONFIG`)
- Modify: `src/scenes/StationScene.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: `POST_FX_CONFIG` from `src/core/GameConfig.ts`, consumed by this task and Task 2.

- [ ] **Step 1: Add `POST_FX_CONFIG` to `GameConfig.ts`**

Append after `PARALLAX_CONFIG` (or `SHADOW_CONFIG` if the parallax-clouds plan hasn't been applied yet):

```ts
// Phaser 3.90 built-in FX pipeline tuning. Vignette is camera-wide (cheap,
// single shader pass, darkens screen edges for mood). Bloom is scoped to
// just Cloudy's sprite (see Cloudy.ts) rather than the whole camera —
// camera-wide bloom would also glow every UI label/icon and hurt
// readability, and bloom is multi-pass (more expensive) so keeping it on
// one small object bounds the cost. Both require WebGL — see the
// `game.renderer.type === Phaser.WEBGL` guards at each call site.
export const POST_FX_CONFIG = {
  vignette: { x: 0.5, y: 0.5, radius: 0.8, strength: 0.35 },
  cloudyBloom: { color: 0xffffff, offsetX: 0, offsetY: 0, blurStrength: 1, strength: 0.6, steps: 4 },
} as const;
```

- [ ] **Step 2: Add the camera vignette in `StationScene.create()`**

In `src/scenes/StationScene.ts`, add `POST_FX_CONFIG` to the existing `GameConfig` import (same line as `GAME_WIDTH, GAME_HEIGHT, PALETTE, FONT_FAMILY, SAFE_ZONE_MARGIN`, currently line 2).

In `create()`, add this near the very start, right after `this.systems = getGameSystems();` (currently line 85) and before `this.drawSky();`:

```ts
    this.systems = getGameSystems();
    this.applyPostFx();

    this.drawSky();
```

Add the new private method near `drawSky()` (e.g. directly above it):

```ts
  // Phaser 3.90's postFX pipeline needs WebGL — this game uses Phaser.AUTO
  // (src/core/Game.ts), which falls back to Canvas2D on devices/WebViews
  // that can't do WebGL. Skip entirely rather than let an unsupported call
  // throw or silently misbehave.
  private applyPostFx(): void {
    if (this.game.renderer.type !== Phaser.WEBGL) return;
    const { x, y, radius, strength } = POST_FX_CONFIG.vignette;
    this.cameras.main.postFX.addVignette(x, y, radius, strength);
  }
```

- [ ] **Step 3: Typecheck, lint, test**

Run: `npx tsc --noEmit && npx eslint . && npx vitest run`
Expected: all clean.

- [ ] **Step 4: Visual check with the dev server**

Run `npm run dev`, open the app. Confirm:
- Screen edges are visibly, subtly darker than the center — not a hard black border, a soft gradient.
- The vignette doesn't meaningfully obscure the top-left title text or the top-right HUD icons/buttons at `SAFE_ZONE_MARGIN` (80px from each edge) — if it does, lower `strength` or raise `radius` in `POST_FX_CONFIG.vignette` and re-check.
- No console errors.

Do **not** run `git commit` after this — move on to Task 2.

---

### Task 2: Subtle bloom on Cloudy's sprite

**Files:**
- Modify: `src/entities/Cloudy.ts`

**Interfaces:**
- Consumes: `POST_FX_CONFIG` from `src/core/GameConfig.ts` (Task 1).
- Produces: nothing new consumed elsewhere.

- [ ] **Step 1: Add the import**

In `src/entities/Cloudy.ts`, add `POST_FX_CONFIG` to the existing `GameConfig` import (currently `import { CLOUDY_CONFIG } from '../core/GameConfig';` at line 2):

```ts
import { CLOUDY_CONFIG, POST_FX_CONFIG } from '../core/GameConfig';
```

- [ ] **Step 2: Apply bloom to the sprite, guarded by the same WebGL check**

In the constructor, right after the sprite is created and added (currently lines 58-59):

```ts
    this.sprite = scene.add.image(0, 0, this.textureKey('idle'));
    this.add(this.sprite);
    this.applyBloom();
```

Add the new private method (e.g. right after the constructor, before `update()`):

```ts
  // Same WebGL guard as StationScene.applyPostFx() — postFX requires WebGL,
  // this game falls back to Canvas2D on devices that can't do it.
  private applyBloom(): void {
    if (this.scene.game.renderer.type !== Phaser.WEBGL) return;
    const { color, offsetX, offsetY, blurStrength, strength, steps } = POST_FX_CONFIG.cloudyBloom;
    this.sprite.postFX.addBloom(color, offsetX, offsetY, blurStrength, strength, steps);
  }
```

This targets `this.sprite` (the single `Image` inside the `Cloudy` container), not `this` (the container) — bloom stays confined to Cloudy's own art and doesn't spread to accessory images added alongside it in `redrawAccessories()`. The FX persists across `setTexture()` calls, so `setShape()` (which swaps `this.sprite`'s texture, not the object itself) doesn't need any extra handling — no code changes needed there.

- [ ] **Step 3: Typecheck, lint, test**

Run: `npx tsc --noEmit && npx eslint . && npx vitest run`
Expected: all clean.

- [ ] **Step 4: Visual check with the dev server**

With `npm run dev` running, look closely at Cloudy. Confirm:
- A soft, subtle glow is visible around Cloudy's silhouette — not an obvious/gaudy halo, a gentle brightening at the edges.
- Switching cosmetic shapes (if reachable via the Cloudy shop UI) keeps the glow — confirms the FX survives `setTexture()` swaps.
- Expression changes (poke/happy/sleepy, e.g. via the dev `H` key) keep the glow, since those also call `setTexture()` through `showExpression()`.
- No visible frame-rate stutter introduced (spot-check with the dev `P` key FPS overlay, `toggleFpsDisplay()`).
- No console errors.

Do **not** run `git commit` after this — move on to Task 3.

---

### Task 3: Full verification pass, including the Canvas-fallback guard

**Files:** none (verification only).

- [ ] **Step 1: Run the full local check suite**

Run: `npx tsc --noEmit && npx vitest run && npx eslint . && npm run build`
Expected: all four commands exit clean (0).

- [ ] **Step 2: Confirm the Canvas-fallback guard actually prevents a crash**

Temporarily force Canvas rendering to prove the guard works, rather than trusting it by inspection alone: in `src/core/Game.ts`, change `type: Phaser.AUTO` to `type: Phaser.CANVAS` (line 14), run `npm run dev`, and confirm the game still loads and runs with **no console errors** (vignette/bloom simply won't be visible — that's correct, expected behavior, not a bug). Then **revert** the change back to `Phaser.AUTO` — this was a temporary manual check, not a permanent config change, and nothing about this plan asked for Canvas-only rendering.

- [ ] **Step 3: Report status**

Summarize to the user: all checks passing, vignette + Cloudy bloom confirmed visually, Canvas-fallback guard verified not to crash, nothing committed unless asked.

---

## Self-Review Notes

- **Spec coverage:** both approved items covered — camera-wide vignette (Task 1), scoped bloom on Cloudy (Task 2), WebGL-only guard addressing the stated Playables/low-end-device risk (both tasks + Task 3's explicit Canvas-fallback check).
- **Placeholder scan:** no TBD/TODO; every step has complete, runnable code.
- **Type consistency:** `POST_FX_CONFIG.vignette`/`POST_FX_CONFIG.cloudyBloom` field names match their destructuring call sites exactly in both `StationScene.applyPostFx()` (Task 1) and `Cloudy.applyBloom()` (Task 2) — no drift between the config shape and its consumers.
