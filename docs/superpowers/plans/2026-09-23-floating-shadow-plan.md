# Floating Shadow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give Cloudy and every Guest a soft ground-anchored shadow that shrinks/fades as they bob up in their existing float animation and grows/brightens as they bob down — selling the "floating above the platform" feeling instead of the current "nothing touches the ground" look.

**Architecture:** A new `FloatingShadow` (`Phaser.GameObjects.Container`) lives *outside* the owning entity's own container (Cloudy's / Guest's `x`/`y` are rewritten every frame by their own bob+drift sine math — a shadow living inside that container would bob right along with it and never read as "cast on a fixed ground below"). Each owning entity creates one `FloatingShadow` in its constructor, calls `shadow.sync(x, floatSin)` once per frame from its own `update()` (passing the exact `Math.sin(...)` value it already computes for its own bob), and destroys it alongside itself. The scale/alpha "breathing" math is a framework-free pure function (`computeShadowVisual`) so it can be unit-tested without a Phaser scene, matching this codebase's existing split between pure-logic files (tested with vitest, `environment: 'node'`) and Phaser-dependent classes (verified visually).

No real shadow art exists yet and this repo has no asset-generation pipeline — every PNG so far (platform, button-frame, guest emotions, …) was generated externally via a Gemini prompt the user runs themselves, then dropped into `public/assets/` and wired into `PreloadScene.ts` in a *separate*, later step (see `src/Plan.md`'s "Đợt 1" history: the `textures.exists()`-gated code shipped first, `this.load.image(...)` was only added once the real file existed — adding the load call before the file exists would 404 during preload). This plan follows the same split: it ships the fallback-ellipse-rendering architecture now, and ends with a ready-to-use Gemini prompt for the user to generate the real texture. Wiring the real file into `PreloadScene.ts` is explicitly **out of scope** for this plan — do it as a short follow-up once the PNG exists.

**Tech Stack:** Phaser 3.90 (`Phaser.GameObjects.Container`/`Ellipse`/`Image`), TypeScript, Vitest (`environment: 'node'` — no DOM/Phaser import allowed in pure-logic test files).

## Global Constraints

- Pure math/logic files must not `import Phaser` — this repo's vitest config runs with `environment: 'node'` (see `vite.config.ts:42`), and existing pure-logic modules (e.g. `src/systems/DayNightSystem.ts`) never import Phaser for exactly this reason.
- Config constants live in `src/core/GameConfig.ts` alongside the existing `CLOUDY_CONFIG`/`GUEST_IDLE_CONFIG`, exported `as const`.
- Do **not** add `this.load.image('fx-shadow', ...)` to `src/scenes/PreloadScene.ts` in this plan — no such file exists yet; that line gets added later, once the user hands back the generated PNG.
- Do not run `git commit` at any point in this plan — the user explicitly asked not to commit this work.

---

### Task 1: Shadow math — pure function + config

**Files:**
- Create: `src/entities/shadowMath.ts`
- Create: `src/entities/shadowMath.test.ts`
- Modify: `src/core/GameConfig.ts` (append `SHADOW_CONFIG` after `GUEST_IDLE_CONFIG`)

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: `SHADOW_CONFIG` (exported `const` object with fields `groundY`, `width`, `height`, `minScale`, `maxScale`, `minAlpha`, `maxAlpha`, `color`) from `src/core/GameConfig.ts`; `computeShadowVisual(floatSin: number): { scale: number; alpha: number }` and its return type `ShadowVisual` from `src/entities/shadowMath.ts`. Task 2 imports both.

- [ ] **Step 1: Add `SHADOW_CONFIG` to `GameConfig.ts`**

Open `src/core/GameConfig.ts` and append after the existing `GUEST_IDLE_CONFIG` block (currently ends at line 67):

```ts
// Ground plane every floating character's shadow anchors to. StationScene's
// drawPlatform() draws the platform as an ellipse centered at
// GAME_HEIGHT*0.72 with height 140 — its top surface sits ~70px above that
// center, so 60px is a slight sink into the surface (looks "cast onto it"
// rather than floating just above the edge). Tune by eye against a
// screenshot if it looks detached from the platform art. Shared by Cloudy
// and every Guest — same visual footprint, no need for per-type values.
export const SHADOW_CONFIG = {
  groundY: Math.round(GAME_HEIGHT * 0.72 - 60),
  width: 90,
  height: 26,
  minScale: 0.6,
  maxScale: 1,
  minAlpha: 0.14,
  maxAlpha: 0.3,
  color: 0x3d2c4a,
} as const;
```

- [ ] **Step 2: Write the failing test for `computeShadowVisual`**

Create `src/entities/shadowMath.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { computeShadowVisual } from './shadowMath';
import { SHADOW_CONFIG } from '../core/GameConfig';

describe('computeShadowVisual', () => {
  it('returns maxScale/maxAlpha at the lowest point of the bob (floatSin = 1)', () => {
    expect(computeShadowVisual(1)).toEqual({
      scale: SHADOW_CONFIG.maxScale,
      alpha: SHADOW_CONFIG.maxAlpha,
    });
  });

  it('returns minScale/minAlpha at the highest point of the bob (floatSin = -1)', () => {
    expect(computeShadowVisual(-1)).toEqual({
      scale: SHADOW_CONFIG.minScale,
      alpha: SHADOW_CONFIG.minAlpha,
    });
  });

  it('returns the midpoint at floatSin = 0', () => {
    const result = computeShadowVisual(0);
    expect(result.scale).toBeCloseTo((SHADOW_CONFIG.minScale + SHADOW_CONFIG.maxScale) / 2);
    expect(result.alpha).toBeCloseTo((SHADOW_CONFIG.minAlpha + SHADOW_CONFIG.maxAlpha) / 2);
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx vitest run src/entities/shadowMath.test.ts`
Expected: FAIL — `Cannot find module './shadowMath'` (file doesn't exist yet).

- [ ] **Step 4: Implement `computeShadowVisual`**

Create `src/entities/shadowMath.ts`:

```ts
import { SHADOW_CONFIG } from '../core/GameConfig';

export interface ShadowVisual {
  scale: number;
  alpha: number;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// floatSin is the exact Math.sin(...) value the owning entity (Cloudy/Guest)
// already computes to offset its own y each frame — range -1..1. +1 is the
// bob's lowest point (closest to the ground plane, so the shadow reads
// largest/clearest); -1 is the bob's highest point (shadow shrinks/fades as
// if receding from the ground).
export function computeShadowVisual(floatSin: number): ShadowVisual {
  const t = (floatSin + 1) / 2;
  return {
    scale: lerp(SHADOW_CONFIG.minScale, SHADOW_CONFIG.maxScale, t),
    alpha: lerp(SHADOW_CONFIG.minAlpha, SHADOW_CONFIG.maxAlpha, t),
  };
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run src/entities/shadowMath.test.ts`
Expected: PASS (3/3 tests).

- [ ] **Step 6: Run the full test suite to confirm no regressions**

Run: `npx vitest run`
Expected: all tests pass (previous total plus these 3 new ones).

---

### Task 2: `FloatingShadow` Phaser class

**Files:**
- Create: `src/entities/FloatingShadow.ts`

**Interfaces:**
- Consumes: `SHADOW_CONFIG` from `src/core/GameConfig.ts`, `computeShadowVisual` from `./shadowMath` (both from Task 1).
- Produces: `export class FloatingShadow extends Phaser.GameObjects.Container` with `constructor(scene: Phaser.Scene, x: number)` and `sync(x: number, floatSin: number): void`. Tasks 3 and 4 construct it and call `sync()` every frame.

- [ ] **Step 1: Implement `FloatingShadow`**

Create `src/entities/FloatingShadow.ts`:

```ts
import Phaser from 'phaser';
import { SHADOW_CONFIG } from '../core/GameConfig';
import { computeShadowVisual } from './shadowMath';

const TEXTURE_KEY = 'fx-shadow';

// Ground-anchored shadow for a floating character (Cloudy/Guest). Lives
// OUTSIDE the owning entity's own Container on purpose — that container's y
// is rewritten every frame by the entity's own bob/drift math, so a shadow
// parented inside it would bob right along and never read as "cast on the
// ground below" it. Owners create one, call sync() every frame with their
// own current x and the same Math.sin(...) value driving their bob, and
// destroy() it alongside themselves.
//
// No 'fx-shadow' texture is registered yet (no asset-generation pipeline in
// this repo — real art is generated externally by the user from a prompt
// and dropped into public/assets/ later, same as platform.png/
// button_frame.png before it). Falls back to a flat soft-alpha ellipse
// until that file exists and gets preloaded under this key.
export class FloatingShadow extends Phaser.GameObjects.Container {
  private readonly visual: Phaser.GameObjects.Image | Phaser.GameObjects.Ellipse;

  constructor(scene: Phaser.Scene, x: number) {
    super(scene, x, SHADOW_CONFIG.groundY);
    scene.add.existing(this);

    this.visual = scene.textures.exists(TEXTURE_KEY)
      ? scene.add.image(0, 0, TEXTURE_KEY)
      : scene.add.ellipse(0, 0, SHADOW_CONFIG.width, SHADOW_CONFIG.height, SHADOW_CONFIG.color, 1);
    this.add(this.visual);
  }

  // x: the owning entity's current world x (tracks horizontal drift).
  // floatSin: the owning entity's current bob Math.sin(...) value, -1..1.
  sync(x: number, floatSin: number): void {
    this.x = x;
    const { scale, alpha } = computeShadowVisual(floatSin);
    this.visual.setScale(scale);
    this.visual.setAlpha(alpha);
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit reminder**

Do **not** run `git commit` — per this plan's Global Constraints, the user asked for this work to stay uncommitted. Move on to Task 3.

---

### Task 3: Wire `FloatingShadow` into Cloudy

**Files:**
- Modify: `src/entities/Cloudy.ts`

**Interfaces:**
- Consumes: `FloatingShadow` from `./FloatingShadow` (Task 2), constructed as `new FloatingShadow(scene, x)`, driven via `.sync(x, floatSin)`, cleaned up via `.destroy()`.
- Produces: nothing new consumed by later tasks — Cloudy and Guest (Task 4) are independent integrations of the same `FloatingShadow` class.

- [ ] **Step 1: Add the import and field**

In `src/entities/Cloudy.ts`, add the import near the top (after the existing `HapticFeedback` import at line 3):

```ts
import { FloatingShadow } from './FloatingShadow';
```

Add a field alongside the other `private readonly` fields (after `private readonly sprite: Phaser.GameObjects.Image;` at line 39):

```ts
  private readonly shadow: FloatingShadow;
```

- [ ] **Step 2: Create the shadow before the container is added to the scene**

In the constructor (currently lines 48-62), insert the shadow creation *before* `scene.add.existing(this)` so it renders behind Cloudy in the display list:

```ts
  constructor(scene: Phaser.Scene, x: number, y: number, shapeId = 'default') {
    super(scene, x, y);
    this.baseX = x;
    this.baseY = y;
    this.shapeId = shapeId;
    this.shadow = new FloatingShadow(scene, x);
    scene.add.existing(this);

    this.sprite = scene.add.image(0, 0, this.textureKey('idle'));
    this.add(this.sprite);

    this.applySpriteScale();
    this.updateHitArea();
    this.wireInput();
    this.scheduleNextBlink();
  }
```

- [ ] **Step 3: Sync the shadow every frame**

Replace the `update()` method (currently lines 64-71):

```ts
  update(_time: number, delta: number): void {
    const dt = delta / 1000;
    this.idleTime += dt;
    const floatSin = Math.sin(this.idleTime * CLOUDY_CONFIG.floatFrequency);
    this.y = this.baseY + floatSin * CLOUDY_CONFIG.floatAmplitude;
    this.x =
      this.baseX + Math.sin(this.idleTime * CLOUDY_CONFIG.driftFrequency) * CLOUDY_CONFIG.driftAmplitude;
    this.shadow.sync(this.x, floatSin);
  }
```

- [ ] **Step 4: Clean up the shadow on destroy**

Cloudy has no `destroy()` override today. Add one after `update()`:

```ts
  destroy(fromScene?: boolean): void {
    this.shadow.destroy();
    super.destroy(fromScene);
  }
```

- [ ] **Step 5: Typecheck and run the full test suite**

Run: `npx tsc --noEmit && npx vitest run`
Expected: no type errors, all tests pass.

- [ ] **Step 6: Visual check with the dev server**

Run: `npm run dev`, open the app in a browser, and look at Cloudy. Confirm:
- A soft dark oval shadow is visible under Cloudy, sitting on the platform art.
- As Cloudy bobs, the shadow visibly shrinks/fades when Cloudy is at the top of its bob and grows/brightens near the bottom.
- The shadow tracks Cloudy's left-right drift.
- No console errors.

Do **not** run `git commit` after this — move on to Task 4.

---

### Task 4: Wire `FloatingShadow` into Guest (base class — covers all 6 guest types)

**Files:**
- Modify: `src/entities/Guest.ts`

**Interfaces:**
- Consumes: `FloatingShadow` from `./FloatingShadow` (Task 2), same usage as Task 3.
- Produces: nothing new — this is the last integration point in the plan.

`Guest` is an abstract base class; `SunGuest`, `MoonGuest`, `LittleStarGuest`, `ButterflyGuest`, `AuroraGuest`, `CometGuest` (under `src/guests/`) all extend it and share its constructor/`update()`/`destroy()`, so this one change covers every guest type with no per-subclass edits.

- [ ] **Step 1: Add the import and field**

In `src/entities/Guest.ts`, add the import near the top (after the existing `HapticFeedback` import at line 4):

```ts
import { FloatingShadow } from './FloatingShadow';
```

Add a field alongside the other `protected readonly`/`private` fields (after `protected readonly bodyGraphics: Phaser.GameObjects.Graphics;` at line 18):

```ts
  private readonly shadow: FloatingShadow;
```

- [ ] **Step 2: Create the shadow before the container is added to the scene**

In the constructor (currently lines 31-57), insert the shadow creation right after `this.baseY = y;` and *before* `scene.add.existing(this)`:

```ts
    super(scene, x, y);
    this.baseX = x;
    this.baseY = y;
    this.shadow = new FloatingShadow(scene, x);
    scene.add.existing(this);
```

(The rest of the constructor — `bodyGraphics`, `addFace()`, `renderVisual()`, `wireInteraction()`, `scheduleNextBlink()`, the pause/resume listeners — stays unchanged.)

- [ ] **Step 3: Sync the shadow every frame**

Replace the `update()` method (currently lines 80-88):

```ts
  update(_time: number, delta: number): void {
    this.idleTime += delta / 1000;
    const floatSin = Math.sin(this.idleTime * GUEST_IDLE_CONFIG.floatFrequency);
    // Bobbing (up and down) using sine wave
    this.y = this.baseY + floatSin * GUEST_IDLE_CONFIG.floatAmplitude;
    // Drift (side to side)
    this.x =
      this.baseX +
      Math.sin(this.idleTime * GUEST_IDLE_CONFIG.driftFrequency) * GUEST_IDLE_CONFIG.driftAmplitude;
    this.shadow.sync(this.x, floatSin);
  }
```

- [ ] **Step 4: Clean up the shadow on destroy**

`Guest.destroy()` already exists (currently lines 199-215). Add `this.shadow.destroy();` before `super.destroy(fromScene);`:

```ts
  destroy(fromScene?: boolean): void {
    // Phaser's own GameObject.destroy() is safe to call twice (it no-ops on
    // the second call) and nulls `this.scene` as part of the first pass — a
    // stale activeGuestEntity reference surviving a scene restart (Station
    // reuses one instance across Journal round-trips) can reach here after
    // that already happened, so this must tolerate `this.scene` being gone
    // rather than assume the constructor's setup still holds.
    if (this.scene) {
      this.scene.events.off('pause', this.handleScenePause);
      this.scene.events.off('resume', this.handleSceneResume);
    }
    // Guests (unlike Cloudy) are routinely destroyed while the scene stays
    // alive (every visit ends this way) — cancel the pending blink so it
    // doesn't fire against a destroyed container later.
    this.blinkTimer?.remove();
    this.shadow.destroy();
    super.destroy(fromScene);
  }
```

- [ ] **Step 5: Typecheck, lint, and run the full test suite**

Run: `npx tsc --noEmit && npx eslint . && npx vitest run`
Expected: no type errors, no lint errors, all tests pass.

- [ ] **Step 6: Visual check with the dev server**

With `npm run dev` still running (or restarted), play through a guest visit:
- Confirm a shadow appears under the guest, breathing with its bob the same way Cloudy's does.
- Confirm the shadow disappears cleanly when the guest leaves (`playLeave()` → `destroy()`), with no leftover shadow stuck on screen.
- Trigger at least 2 different guest types (e.g. Sun and Moon) to confirm the shared base-class change applies to both.
- No console errors.

Do **not** run `git commit` after this — move on to Task 5.

---

### Task 5: Full verification pass

**Files:** none (verification only).

**Interfaces:** none.

- [ ] **Step 1: Run the full local check suite**

Run: `npx tsc --noEmit && npx vitest run && npx eslint . && npm run build`
Expected: all four commands exit clean (0).

- [ ] **Step 2: Playwright/manual pass on both day and night**

Using the existing dev-mode `N` key (day/night debug cycle in `StationScene.ts`) or by waiting for the real clock to cross `DAY_START_HOUR`/`NIGHT_START_HOUR`, confirm the shadow is visible with reasonable contrast against both the day and night platform art (procedural fallback ellipse color `0x3d2c4a` at `alpha` up to `0.3` — if it reads as invisible or as a harsh black blob on either background, adjust `SHADOW_CONFIG.color`/`minAlpha`/`maxAlpha` in `src/core/GameConfig.ts` and re-check).

- [ ] **Step 3: Report status**

Summarize to the user: all checks passing, shadow visible and breathing correctly on Cloudy and guests, nothing committed (per their explicit instruction).

---

### Task 6: Gemini prompt for the real `fx-shadow` texture

**Files:** none (this task's deliverable is text handed to the user, not code — matches how every other real asset in this project was sourced, per `src/Plan.md`'s established prompt-then-wait-for-image workflow).

**Interfaces:** none. This task does not touch `PreloadScene.ts` — that happens in a follow-up once the user has the real PNG (see this plan's Architecture section).

- [ ] **Step 1: Hand the user this prompt**

Give the user the following text to run through Gemini (or their preferred image tool), attaching `public/assets/platform/day.png` as the style-reference image (same style-anchor technique used for every prior asset in this project):

```text
Vẽ 1 hình bóng đổ (shadow) đơn giản, dùng cho nhân vật lơ lửng trong 1 game
mobile phong cách pastel, dễ thương (tham khảo phong cách/màu sắc từ ảnh nền
tảng mây đính kèm).

Yêu cầu:
- 1 hình elip DẸT (tỉ lệ khoảng 3.5:1 chiều ngang:dọc — giống bóng nhìn từ
  góc hơi trên xuống đổ trên mặt phẳng nằm ngang, KHÔNG phải hình tròn).
- Gradient toả tròn mềm: đậm nhất ở tâm, mờ dần đều ra ngoài, biến mất hoàn
  toàn (alpha = 0) ở rìa ngoài cùng — không có viền cứng hay cạnh sắc nét.
- Màu tím-xám đậm ngả nâu (tương tự #3D2C4A), KHÔNG dùng đen thuần.
- Nền trong suốt hoàn toàn (PNG có alpha channel), không có bất kỳ chi tiết
  trang trí nào khác (không hoa văn, không đốm sáng, không viền) — chỉ 1
  hình bóng elip mờ duy nhất, vì ảnh sẽ bị co giãn động lúc chạy game.
- Kích thước ảnh vuông, cạnh khoảng 400-600px, hình elip nằm giữa khung với
  đủ khoảng trong suốt xung quanh để phần mờ dần không bị cắt cạnh.
```

- [ ] **Step 2: Note the follow-up (not part of this plan)**

Once the user sends back the generated PNG, the follow-up work (background/flood-fill cleanup if needed, measuring real dimensions, saving to `public/assets/fx/shadow.png`, and adding `this.load.image('fx-shadow', 'assets/fx/shadow.png');` to `src/scenes/PreloadScene.ts`) is a short separate task — `FloatingShadow.ts`'s `textures.exists('fx-shadow')` check picks it up automatically with no other code changes needed, exactly like `platform`/`button-frame` before it.

---

## Self-Review Notes

- **Spec coverage:** every design point approved during brainstorming is covered — shared `FloatingShadow` for Cloudy+Guest (Task 3, 4), PNG-with-fallback via `textures.exists()` (Task 2), breathing scale/alpha tied to the existing bob sine (Task 1/2), render order via add-sequence not `setDepth` (Task 2/3/4 — shadow constructed and added to the scene before the owning container in both), unit test for the pure math (Task 1), Gemini prompt deliverable (Task 6), no design-doc/commit per the user's explicit instruction (Global Constraints).
- **Placeholder scan:** no TBD/TODO; every step has complete, runnable code.
- **Type consistency:** `FloatingShadow.sync(x: number, floatSin: number): void` (Task 2) is called identically in Task 3 (`this.shadow.sync(this.x, floatSin)`) and Task 4 (`this.shadow.sync(this.x, floatSin)`) — matches. `computeShadowVisual(floatSin: number): ShadowVisual` (Task 1) is the only consumer of `SHADOW_CONFIG`'s scale/alpha fields; `FloatingShadow` (Task 2) separately reads `SHADOW_CONFIG.groundY`/`width`/`height`/`color` directly — no overlap/duplication.
