# Drifting Background Clouds ("Parallax") Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a sense of depth to the sky by drifting a handful of background cloud puffs slowly across it in two layers (a smaller/dimmer/slower "far" layer and a bigger/brighter/faster "near" layer), instead of today's single flat static sky gradient.

**Architecture:** This game has **no camera pan or scroll** (fixed single-screen camera the whole session) — "parallax" here means independently-drifting decorative sprites at two depth-coded speeds, not camera-driven parallax. A new `DriftingCloud` class (`Phaser.GameObjects.Container`, one instance per puff) owns its own horizontal drift + screen-wrap math and is driven every frame from `StationScene.update()`, following the exact same ownership pattern already used for `FloatingIngredient` (`this.floatingIngredients.forEach((ingredient) => ingredient.update(time, delta))`, `StationScene.ts:214`). Each puff renders a shared `bg-cloud` texture if loaded, falling back to a soft `Graphics` ellipse otherwise — the same `textures.exists()`-gated fallback pattern used for `platform`/`fx-shadow` before it, since no `bg-cloud` art exists yet and this repo has no in-house asset-generation pipeline (real art is always generated externally by the user from a prompt and dropped into `public/assets/` later — see `src/Plan.md`'s "Đợt 1" history and the floating-shadow plan that came right before this one).

**Tech Stack:** Phaser 3.90 (`Phaser.GameObjects.Container`/`Ellipse`/`Image`), TypeScript.

## Global Constraints

- Config constants live in `src/core/GameConfig.ts` alongside `CLOUDY_CONFIG`/`GUEST_IDLE_CONFIG`/`SHADOW_CONFIG`, exported `as const`.
- Do **not** add `this.load.image('bg-cloud', ...)` to `src/scenes/PreloadScene.ts` in this plan — no such file exists yet; that line gets added later, once the user hands back the generated PNG (see Task 3).
- **Lesson from the floating-shadow work done just before this plan:** the `fx-shadow.png` Gemini generated initially had an *opaque light-grey checkerboard* background instead of true alpha transparency (Gemini drew a picture that visually resembles the standard "transparency" checkerboard convention rather than actually setting per-pixel alpha to 0) — it looked fine in every preview but rendered as a solid grey square in the actual game. The Gemini prompt in Task 3 explicitly warns against this exact failure mode. Whoever processes the returned image **must** verify real transparency before wiring it in — composite it over a solid, saturated color (not white/grey) and confirm that color shows through the background, the way `src/Plan.md`'s established flood-fill-background-removal steps do for every other asset.
- Do not run `git commit` at any point in this plan unless the user asks for it in this session.

---

### Task 1: `DriftingCloud` — one drifting puff

**Files:**
- Create: `src/entities/DriftingCloud.ts`
- Modify: `src/core/GameConfig.ts` (append `PARALLAX_CONFIG` after `SHADOW_CONFIG`)

**Interfaces:**
- Consumes: `PARALLAX_CONFIG` from `src/core/GameConfig.ts` (this task defines it).
- Produces: `export class DriftingCloud extends Phaser.GameObjects.Container` with `constructor(scene: Phaser.Scene, x: number, options: DriftingCloudOptions)` and `update(time: number, delta: number): void`. Task 2 constructs instances and drives them.

- [ ] **Step 1: Add `PARALLAX_CONFIG` to `GameConfig.ts`**

Append after the `SHADOW_CONFIG` block:

```ts
// Background cloud drift ("parallax" without a camera — this game's camera
// never pans, so depth comes from two independently-drifting puff layers
// instead). Far layer: smaller, dimmer, slower. Near layer: bigger,
// brighter, faster. Both drift left-to-right and wrap back to the left
// edge once fully off-screen (see DriftingCloud.update()).
export const PARALLAX_CONFIG = {
  farCloud: { count: 3, yRange: [100, 170] as const, scaleRange: [0.35, 0.5] as const, alphaRange: [0.35, 0.5] as const, speed: 6 },
  nearCloud: { count: 2, yRange: [190, 250] as const, scaleRange: [0.55, 0.75] as const, alphaRange: [0.5, 0.7] as const, speed: 14 },
  wrapMargin: 120,
} as const;
```

- [ ] **Step 2: Implement `DriftingCloud`**

Create `src/entities/DriftingCloud.ts`:

```ts
import Phaser from 'phaser';
import { GAME_WIDTH, PARALLAX_CONFIG } from '../core/GameConfig';

const TEXTURE_KEY = 'bg-cloud';

export interface DriftingCloudOptions {
  y: number;
  scale: number;
  alpha: number;
  /** px/sec, always positive — every puff drifts left-to-right. */
  speed: number;
}

// One background cloud puff, drifting slowly across the sky and wrapping
// back to the left edge once it clears the right edge. Purely decorative —
// no interaction, no effect on gameplay. Renders the shared 'bg-cloud'
// texture if loaded, otherwise a soft Graphics ellipse fallback (same
// textures.exists()-gated pattern as FloatingShadow/platform before it).
export class DriftingCloud extends Phaser.GameObjects.Container {
  private readonly visual: Phaser.GameObjects.Image | Phaser.GameObjects.Ellipse;
  private readonly speed: number;

  constructor(scene: Phaser.Scene, x: number, options: DriftingCloudOptions) {
    super(scene, x, options.y);
    scene.add.existing(this);
    this.speed = options.speed;

    this.visual = scene.textures.exists(TEXTURE_KEY)
      ? scene.add.image(0, 0, TEXTURE_KEY)
      : scene.add.ellipse(0, 0, 140, 50, 0xffffff, 1);
    this.visual.setScale(options.scale);
    this.visual.setAlpha(options.alpha);
    this.add(this.visual);
  }

  update(_time: number, delta: number): void {
    this.x += (this.speed * delta) / 1000;
    if (this.x > GAME_WIDTH + PARALLAX_CONFIG.wrapMargin) {
      this.x = -PARALLAX_CONFIG.wrapMargin;
    }
  }
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

---

### Task 2: Spawn and drive the two cloud layers from `StationScene`

**Files:**
- Modify: `src/scenes/StationScene.ts`

**Interfaces:**
- Consumes: `DriftingCloud` and `DriftingCloudOptions` from `../entities/DriftingCloud` (Task 1), `PARALLAX_CONFIG` from `../core/GameConfig`.
- Produces: nothing new consumed by later tasks.

- [ ] **Step 1: Add the import and field**

In `src/scenes/StationScene.ts`, add the import near the other entity imports (after the `Decoration` import, currently line 14):

```ts
import { DriftingCloud } from '../entities/DriftingCloud';
```

Add a field alongside the other entity-collection fields (after `private floatingIngredients: FloatingIngredient[] = [];`, currently line 68):

```ts
  private backgroundClouds: DriftingCloud[] = [];
```

- [ ] **Step 2: Spawn the layers right after the sky is drawn, before the platform**

In `create()`, insert a call right after `this.drawSky();` and before `this.drawPlatform();` (currently `create()` opens at line 84, with `drawSky()`/`drawPlatform()` at lines 87-88):

```ts
    this.drawSky();
    this.spawnBackgroundClouds();
    this.drawPlatform();
```

This ordering matters for render order: clouds get added to the scene's display list after the sky (so they draw on top of it) and before the platform/Cloudy/everything else (so they draw behind all of it) — the same add-order-controls-stacking technique already used for `FloatingShadow` (see `src/entities/Cloudy.ts`'s constructor, which creates its shadow before `scene.add.existing(this)` for the same reason).

- [ ] **Step 3: Implement `spawnBackgroundClouds()`**

Add this private method near `drawSky()`/`drawPlatform()` (e.g. directly above `private drawSky(): void {` — currently line 815):

```ts
  // "Parallax" without a camera pan (this game's camera is fixed all
  // session) — two layers of puffs drifting at different speeds/sizes/
  // alphas stand in for depth instead. See DriftingCloud.ts.
  private spawnBackgroundClouds(): void {
    const layers = [PARALLAX_CONFIG.farCloud, PARALLAX_CONFIG.nearCloud];
    layers.forEach((layer) => {
      for (let i = 0; i < layer.count; i += 1) {
        const x = Phaser.Math.Between(0, GAME_WIDTH);
        const y = Phaser.Math.Between(layer.yRange[0], layer.yRange[1]);
        const scale = Phaser.Math.FloatBetween(layer.scaleRange[0], layer.scaleRange[1]);
        const alpha = Phaser.Math.FloatBetween(layer.alphaRange[0], layer.alphaRange[1]);
        this.backgroundClouds.push(new DriftingCloud(this, x, { y, scale, alpha, speed: layer.speed }));
      }
    });
  }
```

`PARALLAX_CONFIG` needs to be added to the existing `GameConfig` import at the top of the file (find the line importing `GAME_WIDTH, GAME_HEIGHT, PALETTE, FONT_FAMILY, SAFE_ZONE_MARGIN` from `'../core/GameConfig'`, currently line 2) — add `PARALLAX_CONFIG` to that same import list.

- [ ] **Step 4: Drive the clouds every frame**

In `update()` (currently lines 211-220), add a line alongside the existing `floatingIngredients.forEach(...)`:

```ts
  update(time: number, delta: number): void {
    this.cloudy.update(time, delta);
    this.activeGuestEntity?.update(time, delta);
    this.floatingIngredients.forEach((ingredient) => ingredient.update(time, delta));
    this.backgroundClouds.forEach((cloud) => cloud.update(time, delta));

    if (this.fpsText) {
      this.performanceMonitor.update(delta);
      this.fpsText.setText(`${this.performanceMonitor.getFps()} FPS`);
    }
  }
```

- [ ] **Step 5: Typecheck, lint, test**

Run: `npx tsc --noEmit && npx eslint . && npx vitest run`
Expected: all clean.

- [ ] **Step 6: Visual check with the dev server**

Run `npm run dev`, open the app, and watch the sky for ~15-20 seconds. Confirm:
- 3 small, dim, slow puffs drift across the upper sky; 2 bigger, brighter, faster puffs drift below them.
- Each puff smoothly wraps from the right edge back to the left edge once fully off-screen — no visible pop/flicker at the wrap point, no puff frozen or stuck.
- Puffs render behind the platform/Cloudy/guests/decorations and above the sky gradient — no z-order glitches.
- No overlap with the top-left title text or top-right HUD icons (crystal counter, mute, help) — `PARALLAX_CONFIG`'s `yRange` values (100-250) sit below `SAFE_ZONE_MARGIN` (80) and above Cloudy's `baseY` (`GAME_HEIGHT*0.48` ≈ 346); if a puff visibly clips a HUD element at some resting `x`, tighten `yRange` and re-check.
- No console errors.

Do **not** run `git commit` after this — move on to Task 3.

---

### Task 3: Gemini prompt for the real `bg-cloud` texture

**Files:** none (this task's deliverable is text handed to the user, not code).

**Interfaces:** none. This task does not touch `PreloadScene.ts` — that happens in a short follow-up once the user has the real PNG, exactly like `fx-shadow.png` before it.

- [ ] **Step 1: Hand the user this prompt**

Give the user the following text to run through Gemini, attaching `public/assets/platform/day.png` as the style-reference image:

```text
Vẽ 1 cụm mây nền đơn giản, dùng làm mây trôi trang trí phía xa trên bầu
trời trong 1 game mobile phong cách pastel, dễ thương (tham khảo phong
cách/màu sắc từ ảnh nền tảng mây đính kèm).

Yêu cầu:
- 1 cụm mây tròn mềm mại, viền mờ dần tự nhiên (không viền cứng/nét đen
  bao quanh), giống mây thật nhìn từ xa.
- Màu trắng hoặc trắng ngà pha chút pastel nhẹ, đơn sắc (không cần nhiều
  chi tiết bên trong, sẽ hiển thị nhỏ và có thể lặp lại nhiều lần).
- QUAN TRỌNG — nền phải TRONG SUỐT THẬT (kênh alpha thật = 0 ở vùng nền),
  KHÔNG PHẢI vẽ một ô caro xám/trắng để "tượng trưng" cho trong suốt. Nếu
  công cụ không hỗ trợ xuất PNG có alpha thật, hãy nói rõ trong câu trả lời
  thay vì trả về ảnh có nền caro — tôi cần biết để tự xử lý lại.
- Không có bất kỳ chi tiết trang trí rời rạc nào khác (không có ngôi sao,
  chấm sáng, hay vật thể phụ) — chỉ 1 hình mây duy nhất, vì ảnh sẽ được
  dùng lại nhiều lần với kích thước/độ mờ khác nhau.
- Kích thước ảnh vuông, cạnh khoảng 400-600px, cụm mây nằm giữa khung với
  đủ khoảng trong suốt xung quanh để phần viền mờ dần không bị cắt cạnh.
```

- [ ] **Step 2: Note the follow-up (not part of this plan)**

Once the user sends back the generated PNG: **before** wiring it in, composite it over a solid saturated color (e.g. pure red, `ffmpeg -f lavfi -i "color=c=red:s=<W>x<H>" -i <file> -filter_complex "overlay=0:0" -frames:v 1 -update 1 <out>.png`, then read a background-region pixel from that composite and confirm it's close to pure red, not the cloud's own light color) to catch the exact "opaque checkerboard" failure mode described in this plan's Global Constraints before it ever reaches the running game. Once confirmed transparent: resize down (2048px Gemini output → roughly 150-200px is plenty, this asset renders at 35-75% scale per `PARALLAX_CONFIG`), save to `public/assets/bg/cloud.png`, add `this.load.image('bg-cloud', 'assets/bg/cloud.png');` to `PreloadScene.ts` (same direct-key pattern as `platform`/`fx-shadow`). `DriftingCloud.ts`'s `textures.exists('bg-cloud')` check picks it up automatically — no other code changes needed.

---

## Self-Review Notes

- **Spec coverage:** two-layer drifting cloud background (Task 1-2), real-art path via Gemini prompt with the checkerboard-transparency lesson baked in (Task 3), fallback ellipse ships today without waiting for art (Task 1).
- **Placeholder scan:** no TBD/TODO; every step has complete, runnable code.
- **Type consistency:** `DriftingCloud.update(time: number, delta: number): void` (Task 1) matches the call site `this.backgroundClouds.forEach((cloud) => cloud.update(time, delta))` (Task 2) and the existing `floatingIngredients.forEach((ingredient) => ingredient.update(time, delta))` call right above it — same signature shape as every other per-frame entity in this scene.
