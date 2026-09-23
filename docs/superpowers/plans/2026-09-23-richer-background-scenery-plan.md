# Richer Background Scenery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the sky read richer/more atmospheric, per a reference screenshot the user liked: a 3-stop gradient sky (instead of today's flat 2-stop fill), 2-3 static hazy landmarks near the horizon for depth, and 2 birds crossing the sky during the day. Explicitly **out of scope** (user confirmed): the reference image's water/ocean reflection at the bottom, its HUD/nav redesign, and its enlarged glass-still mixer — none of those are touched here.

**Architecture:** All three pieces slot into the exact patterns this session already established and proved working: `redrawSky()` grows from a 2-stop to a 3-stop gradient (two stacked `fillGradientStyle` rects instead of one); distant scenery is fully static (create-once, no `update()`, no class — just a method, since there's no per-instance behavior to encapsulate); birds get a new `AmbientBirds` class that copies `AmbientFireflies.ts` verbatim in spirit (tween-only, no scene `update()`-loop coupling, `setDepth(150)` so z-order is correct regardless of when day breaks and birds spawn) but add a horizontal "cross and repeat" tween plus a bobbing tween for a flap-like motion. Both new art assets (`bg-scenery`, `bg-bird`) follow this project's now-established art pipeline exactly: fallback `Graphics` ships today, a Gemini prompt (with the transparency-checkerboard warning baked in, learned the hard way earlier today) is handed to the user, and wiring the real PNG into `PreloadScene.ts` is a deliberately separate follow-up once the file exists.

**Tech Stack:** Phaser 3.90 (`Graphics`, `Container`, `Image`, `Tweens`), TypeScript.

## Global Constraints

- Config constants live in `src/core/GameConfig.ts` alongside `PARALLAX_CONFIG`/`POST_FX_CONFIG`, exported `as const`. Reuse existing `PALETTE` tones for the day sky gradient's new middle stop — no new hex values invented for that one.
- Do **not** add `this.load.image('bg-scenery' | 'bg-bird', ...)` to `PreloadScene.ts` in this plan — see Task 4; that line gets added later, once the user hands back the generated PNGs, exactly like `fx-shadow.png`/`bg-cloud.png` before them.
- Every Gemini prompt in this plan explicitly warns against the opaque-checkerboard-background failure mode discovered earlier today (`fx-shadow.png` and `bg-cloud.png` both initially came back with a picture of a transparency checkerboard instead of real alpha=0), and whoever processes the returned image must verify real transparency via a solid-color composite before wiring it in (not by eyeballing a preview, which can't tell real transparency from a drawn checkerboard).
- Do not run `git commit` at any point in this plan unless the user asks for it in this session.

---

### Task 1: 3-stop sky gradient

**Files:**
- Modify: `src/core/GameConfig.ts` (append `SKY_GRADIENT_CONFIG`)
- Modify: `src/scenes/StationScene.ts` (`redrawSky()`)

**Interfaces:**
- Produces: `SKY_GRADIENT_CONFIG` from `src/core/GameConfig.ts`, consumed only by `redrawSky()`.

- [ ] **Step 1: Add `SKY_GRADIENT_CONFIG` to `GameConfig.ts`**

Append after `PALETTE` (line 39):

```ts
// 3-stop vertical sky gradient (replaces the old flat 2-stop fill) — richer
// without adding a third day/night state: DayNightSystem still only knows
// day/night, this just makes each of those two looks more atmospheric. Day
// reuses existing PALETTE tones (no new hex values); night's middle stop is
// a purple consistent with VFX_TINT.moonPurple's family in ParticleEffect.ts.
export const SKY_GRADIENT_CONFIG = {
  day: { top: PALETTE.skyTop, mid: PALETTE.pastelPink, bottom: PALETTE.skyBottom },
  night: { top: 0x1c2340, mid: 0x4a3a6b, bottom: 0x3a3564 },
} as const;
```

- [ ] **Step 2: Replace `redrawSky()`'s single fill with two stacked gradients**

In `src/scenes/StationScene.ts`, add `SKY_GRADIENT_CONFIG` to the existing `GameConfig` import (line 2, same line as `PARALLAX_CONFIG, POST_FX_CONFIG`).

Replace `redrawSky()` (currently lines 486-495):

```ts
  private redrawSky(): void {
    const night = this.systems.dayNightSystem.isNight();
    const { top, mid, bottom } = night ? SKY_GRADIENT_CONFIG.night : SKY_GRADIENT_CONFIG.day;
    this.sky.clear();
    const midY = GAME_HEIGHT / 2;
    this.sky.fillGradientStyle(top, top, mid, mid, 1);
    this.sky.fillRect(0, 0, GAME_WIDTH, midY);
    this.sky.fillGradientStyle(mid, mid, bottom, bottom, 1);
    this.sky.fillRect(0, midY, GAME_WIDTH, GAME_HEIGHT - midY);
  }
```

The two rects share the exact `mid` color at their shared edge (`y = GAME_HEIGHT / 2`), so the seam between them is invisible — the net effect reads as one smooth 3-stop gradient (top→mid→bottom) using two `fillGradientStyle` calls, since Phaser's `Graphics.fillGradientStyle` only supports 2-stop (4-corner) gradients per call.

- [ ] **Step 3: Typecheck, lint, test**

Run: `npx tsc --noEmit && npx eslint . && npx vitest run`
Expected: all clean (no test changes needed — `redrawSky()` has no existing unit test, verified visually like every other draw method in this file).

- [ ] **Step 4: Visual check with the dev server**

Run `npm run dev`. Confirm:
- Day sky now shows a visible pink/peach band fading between the blue top and cream bottom, not a flat 2-color fill.
- Press the dev-only `N` key to cycle day/night (per `StationScene.ts`'s debug-key block) — confirm the night sky also shows a visible purple middle band between the two navy tones.
- No hard seam/banding artifact visible at the gradient's midpoint.
- No console errors.

Do **not** run `git commit` after this — move on to Task 2.

---

### Task 2: Static distant scenery (hazy horizon landmarks)

**Files:**
- Modify: `src/core/GameConfig.ts` (append `DISTANT_SCENERY_CONFIG`)
- Modify: `src/scenes/StationScene.ts`

**Interfaces:**
- Produces: `DISTANT_SCENERY_CONFIG` from `src/core/GameConfig.ts`, consumed only by `spawnDistantScenery()`. No class — this is fully static (create-once, no per-instance behavior), so a plain private method is the right size, not a new entity file.

- [ ] **Step 1: Add `DISTANT_SCENERY_CONFIG` to `GameConfig.ts`**

Append after `SKY_GRADIENT_CONFIG`:

```ts
// Static hazy landmarks near the horizon, for depth — unlike DriftingCloud,
// these never move (no update() loop, no class, just placed once in
// create()). ySo they sit below the drifting-cloud layer (PARALLAX_CONFIG's
// yRange tops out at 250) and above the platform's top edge (~448 — see
// drawPlatform()), with clear vertical separation from both.
export const DISTANT_SCENERY_CONFIG = {
  xFractions: [0.12, 0.5, 0.85] as const,
  yRange: [260, 300] as const,
  scaleRange: [0.3, 0.45] as const,
  alpha: 0.45,
} as const;
```

- [ ] **Step 2: Add `spawnDistantScenery()` and call it from `create()`**

In `src/scenes/StationScene.ts`, add `DISTANT_SCENERY_CONFIG` to the `GameConfig` import (same line as `SKY_GRADIENT_CONFIG` from Task 1).

In `create()`, call the new method right after `this.drawSky();` and before `this.spawnBackgroundClouds();` (currently lines 92-93) — scenery renders behind the drifting clouds, matching "distant landmark is farther away than nearby cloud":

```ts
    this.drawSky();
    this.spawnDistantScenery();
    this.spawnBackgroundClouds();
```

Add the method right before `spawnBackgroundClouds()` (currently starts at line 934):

```ts
  // Static hazy landmarks near the horizon — no drift, no update() loop, see
  // DISTANT_SCENERY_CONFIG's comment for why. Falls back to a simple
  // mushroom-cap-on-a-stem silhouette if 'bg-scenery' isn't loaded yet.
  private spawnDistantScenery(): void {
    const config = DISTANT_SCENERY_CONFIG;
    config.xFractions.forEach((xFrac, index) => {
      const x = GAME_WIDTH * xFrac;
      const y = Phaser.Math.Between(config.yRange[0], config.yRange[1]);
      const scale = Phaser.Math.FloatBetween(config.scaleRange[0], config.scaleRange[1]);

      let obj: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics;
      if (this.textures.exists('bg-scenery')) {
        const image = this.add.image(x, y, 'bg-scenery');
        image.setScale(scale);
        // Mirror every other instance so 3 placements don't all look
        // identical despite sharing one texture.
        if (index % 2 === 1) image.setFlipX(true);
        obj = image;
      } else {
        const g = this.add.graphics();
        g.fillStyle(PALETTE.lavender, 1);
        g.fillEllipse(x, y, 70, 30);
        g.fillRect(x - 8, y, 16, 20);
        obj = g;
      }
      obj.setAlpha(config.alpha);
    });
  }
```

- [ ] **Step 3: Typecheck, lint, test**

Run: `npx tsc --noEmit && npx eslint . && npx vitest run`
Expected: all clean.

- [ ] **Step 4: Visual check with the dev server**

With `npm run dev` running, confirm:
- 3 faint, hazy mushroom-island silhouettes visible near the horizon (above the platform, below the drifting clouds), at roughly left/center/right.
- They stay perfectly still — no drift, no flicker, no wrap.
- They don't visually clash with the title text or HUD icons (their `yRange`, 260-300, is well clear of both the title at `SAFE_ZONE_MARGIN`≈80 and the platform starting ~380+).
- No console errors.

Do **not** run `git commit` after this — move on to Task 3.

---

### Task 3: Day-only ambient birds

**Files:**
- Create: `src/entities/AmbientBirds.ts`
- Modify: `src/core/GameConfig.ts` (append `BIRDS_CONFIG`)
- Modify: `src/scenes/StationScene.ts`

**Interfaces:**
- Produces: `export class AmbientBirds` with `constructor(scene: Phaser.Scene, count?: number)` and `destroy(): void` — same shape as `AmbientFireflies`, consumed by `StationScene.syncBirds()`.

- [ ] **Step 1: Add `BIRDS_CONFIG` to `GameConfig.ts`**

Append after `DISTANT_SCENERY_CONFIG`:

```ts
// Day-only birds crossing the sky. Shares AmbientFireflies' depth (150 —
// above background/platform, below UI's 500+) and its tween-only
// architecture (no scene update()-loop coupling needed for either).
export const BIRDS_CONFIG = {
  count: 2,
  yRange: [150, 260] as const,
  scaleRange: [0.4, 0.55] as const,
  crossDurationMsRange: [7000, 11000] as const,
  bobAmplitude: 10,
  depth: 150,
} as const;
```

- [ ] **Step 2: Implement `AmbientBirds`**

Create `src/entities/AmbientBirds.ts`:

```ts
import Phaser from 'phaser';
import { GAME_WIDTH, PALETTE, BIRDS_CONFIG } from '../core/GameConfig';

const TEXTURE_KEY = 'bg-bird';

// Day-only birds drifting left-to-right across the sky, each on its own
// repeating "cross the screen, snap back to start, cross again" tween —
// Phaser's tween `repeat: -1` resets a target back to its value from when
// the tween was created on every repeat, which is exactly the wrap-around
// DriftingCloud.ts computes by hand in its own update() loop, but for free
// here since nothing else needs per-frame control over these. A second,
// independent yoyo tween adds a gentle vertical bob (flap) on top. No
// texture loaded yet falls back to a simple two-arc "bird doodle" silhouette
// (same textures.exists()-gated pattern as every other asset this session).
export class AmbientBirds {
  private birds: Phaser.GameObjects.Container[] = [];
  private tweens: Phaser.Tweens.Tween[] = [];

  constructor(scene: Phaser.Scene, count = BIRDS_CONFIG.count) {
    for (let i = 0; i < count; i += 1) {
      const startX = Phaser.Math.Between(-100, GAME_WIDTH + 100);
      const y = Phaser.Math.Between(BIRDS_CONFIG.yRange[0], BIRDS_CONFIG.yRange[1]);
      const scale = Phaser.Math.FloatBetween(BIRDS_CONFIG.scaleRange[0], BIRDS_CONFIG.scaleRange[1]);

      const container = scene.add.container(startX, y);
      container.setDepth(BIRDS_CONFIG.depth);
      container.setScale(scale);

      if (scene.textures.exists(TEXTURE_KEY)) {
        container.add(scene.add.image(0, 0, TEXTURE_KEY));
      } else {
        const g = scene.add.graphics();
        g.lineStyle(2, PALETTE.eyeColor, 0.6);
        g.beginPath();
        g.arc(-6, 0, 6, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(340), false);
        g.arc(6, 0, 6, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(340), false);
        g.strokePath();
        container.add(g);
      }

      const crossDuration = Phaser.Math.Between(
        BIRDS_CONFIG.crossDurationMsRange[0],
        BIRDS_CONFIG.crossDurationMsRange[1],
      );
      const flightTween = scene.tweens.add({
        targets: container,
        x: GAME_WIDTH + 100,
        duration: crossDuration,
        repeat: -1,
        ease: 'Linear',
        delay: Phaser.Math.Between(0, 3000),
      });
      const bobTween = scene.tweens.add({
        targets: container,
        y: y - BIRDS_CONFIG.bobAmplitude,
        duration: 400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      this.birds.push(container);
      this.tweens.push(flightTween, bobTween);
    }
  }

  destroy(): void {
    this.tweens.forEach((t) => t.destroy());
    this.birds.forEach((b) => b.destroy());
    this.tweens = [];
    this.birds = [];
  }
}
```

- [ ] **Step 3: Wire into `StationScene.ts`, mirroring `AmbientFireflies` exactly**

Add the import (after `import { AmbientFireflies } from '../entities/AmbientFireflies';`, currently line 16):

```ts
import { AmbientBirds } from '../entities/AmbientBirds';
```

Add the field (after `private fireflies: AmbientFireflies | null = null;`, currently line 72):

```ts
  private birds: AmbientBirds | null = null;
```

Add `this.syncBirds();` to `syncAmbience()` (currently lines 497-504), right after `this.syncFireflies();`:

```ts
  private syncAmbience(): void {
    this.systems.audioSystem.setAmbienceContext({
      isNight: this.systems.dayNightSystem.isNight(),
      hasWindGarden: this.systems.stationAreaSystem.isUnlocked('wind_garden'),
      hasRainGarden: this.systems.stationAreaSystem.isUnlocked('rain_garden'),
    });
    this.syncFireflies();
    this.syncBirds();
  }
```

Add `syncBirds()` right after `syncFireflies()` (currently ends at line 514):

```ts
  private syncBirds(): void {
    const isNight = this.systems.dayNightSystem.isNight();
    if (!isNight && !this.birds) {
      this.birds = new AmbientBirds(this);
    } else if (isNight && this.birds) {
      this.birds.destroy();
      this.birds = null;
    }
  }
```

Add cleanup in the `SHUTDOWN` handler (currently lines 367-380), right after `this.fireflies = null;`:

```ts
      this.fireflies?.destroy();
      this.fireflies = null;
      this.birds?.destroy();
      this.birds = null;
    });
```

- [ ] **Step 4: Typecheck, lint, test**

Run: `npx tsc --noEmit && npx eslint . && npx vitest run`
Expected: all clean.

- [ ] **Step 5: Visual check with the dev server**

With `npm run dev` running:
- On load (daytime), confirm 2 small bird silhouettes cross the sky left-to-right at different heights, each with a gentle up-down bob, and wrap back to the left edge to cross again — no visible teleport/flash at the wrap (Phaser's tween-repeat reset should be seamless since it happens off-screen, past `GAME_WIDTH + 100`).
- Press the dev-only `N` key to switch to night — confirm both birds disappear and fireflies appear instead (never both at once).
- Press `N` again back to day — confirm birds reappear.
- No console errors, no leftover birds stuck on screen after repeated day/night toggling (confirms `destroy()` is actually firing, not leaking).

Do **not** run `git commit` after this — move on to Task 4.

---

### Task 4: Gemini prompts for the two new textures

**Files:** none (this task's deliverable is text handed to the user, not code — matches every other real asset in this session).

**Interfaces:** none. Neither prompt's output gets wired into `PreloadScene.ts` in this plan — that's a short follow-up once the PNGs exist, exactly like `fx-shadow.png`/`bg-cloud.png`.

- [ ] **Step 1: Hand the user this prompt for `bg-scenery` (distant mushroom island)**

Attach `public/assets/platform/day.png` as the style-reference image (closest existing analog — a small floating island):

```text
Vẽ 1 đảo nhỏ/nhà nấm nhỏ nhìn từ xa, dùng làm cảnh vật nền mờ ở đường chân
trời trong 1 game mobile phong cách pastel, dễ thương (tham khảo phong
cách/màu sắc từ ảnh nền tảng mây đính kèm — đây là "người anh em nhỏ hơn,
xa hơn" của hòn đảo chính trong ảnh đó).

Yêu cầu:
- 1 hòn đảo/nhà nấm nhỏ đơn giản, dáng tương tự đảo mây chính nhưng đơn
  giản hoá nhiều (ít chi tiết hơn hẳn, vì sẽ hiển thị rất nhỏ và mờ).
- Màu sắc có thể dùng tông pastel bình thường (không cần tự làm mờ/tối màu
  — độ "xa/mờ" sẽ được xử lý bằng alpha lúc chạy game, không cần làm trong
  ảnh).
- QUAN TRỌNG — nền phải TRONG SUỐT THẬT (kênh alpha thật = 0 ở vùng nền),
  KHÔNG PHẢI vẽ một ô caro xám/trắng để "tượng trưng" cho trong suốt. Nếu
  công cụ không hỗ trợ xuất PNG có alpha thật, hãy nói rõ trong câu trả lời
  thay vì trả về ảnh có nền caro.
- Không có chi tiết trang trí rời rạc nào khác quanh đảo — chỉ 1 hình đảo
  duy nhất, vì ảnh sẽ được dùng lại nhiều lần (kể cả lật ngang) ở các vị
  trí khác nhau.
- Kích thước ảnh vuông, cạnh khoảng 400-600px, đảo nằm giữa khung với đủ
  khoảng trong suốt xung quanh.
```

- [ ] **Step 2: Hand the user this prompt for `bg-bird` (flying bird)**

Attach `public/assets/cloudy/default/idle.png` as the style-reference image (closest existing analog — the game's main character art style):

```text
Vẽ 1 con chim nhỏ đang bay, nhìn nghiêng hoặc từ dưới lên, dùng làm sinh vật
nền bay ngang bầu trời trong 1 game mobile phong cách pastel, dễ thương
(tham khảo phong cách/màu sắc từ ảnh nhân vật chính đính kèm).

Yêu cầu:
- 1 con chim nhỏ đơn giản, dáng bay dang cánh (kiểu chữ M/chữ W cách điệu),
  không cần chi tiết lông vũ phức tạp — sẽ hiển thị rất nhỏ.
- Màu pastel đơn giản, tương phản vừa đủ để nhìn thấy trên nền trời xanh
  lẫn nền trời tối (đêm) — tránh màu quá nhạt/trắng dễ bị chìm vào trời.
- QUAN TRỌNG — nền phải TRONG SUỐT THẬT (kênh alpha thật = 0 ở vùng nền),
  KHÔNG PHẢI vẽ một ô caro xám/trắng để "tượng trưng" cho trong suốt. Nếu
  công cụ không hỗ trợ xuất PNG có alpha thật, hãy nói rõ trong câu trả lời
  thay vì trả về ảnh có nền caro.
- Không có chi tiết trang trí rời rạc nào khác — chỉ 1 hình chim duy nhất.
- Kích thước ảnh vuông, cạnh khoảng 300-500px, chim nằm giữa khung với đủ
  khoảng trong suốt xung quanh.
```

- [ ] **Step 3: Note the follow-up (not part of this plan)**

Once the user sends back each PNG: **before** wiring it in, composite it over a solid saturated color (e.g. pure red — `ffmpeg -f lavfi -i "color=c=red:s=<W>x<H>" -i <file> -filter_complex "overlay=0:0" -frames:v 1 -update 1 <out>.png`, then sample a background-region pixel and confirm it's close to pure red) to catch the opaque-checkerboard failure mode before it ever reaches the running game — if it fails that check, use the border flood-fill technique from today's `bg-cloud.png` fix (BFS from every border pixel through same-colored regions, not a global color-key, since a global key risks eating into real content that happens to share a similar tone). Once confirmed transparent: resize down (Gemini's default output is typically 2048px — for `bg-scenery`, ~150-200px is plenty given it renders at 30-45% scale; for `bg-bird`, ~120-150px given it renders at 40-55% scale), save to `public/assets/bg/scenery.png` and `public/assets/bg/bird.png`, and add both lines to `PreloadScene.ts`:

```ts
this.load.image('bg-scenery', 'assets/bg/scenery.png');
this.load.image('bg-bird', 'assets/bg/bird.png');
```

No other code changes needed — `spawnDistantScenery()`'s and `AmbientBirds`' `textures.exists()` checks pick up the real art automatically.

---

### Task 5: Full verification pass

**Files:** none (verification only).

- [ ] **Step 1: Run the full local check suite**

Run: `npx tsc --noEmit && npx vitest run && npx eslint . && npm run build`
Expected: all four commands exit clean (0).

- [ ] **Step 2: Combined visual pass**

With `npm run dev` running, confirm all three pieces together, not just individually: richer gradient sky, 3 static hazy islands near the horizon, drifting clouds above them, 2 birds crossing during the day — no z-order glitches (birds/clouds/scenery/platform/Cloudy all layer correctly), no overlap with title/HUD text, no console errors. Cycle day/night with `N` a few times in a row to confirm birds/fireflies swap cleanly every time, not just the first time.

- [ ] **Step 3: Report status**

Summarize to the user: all checks passing, gradient/scenery/birds confirmed working visually, two Gemini prompts ready to hand over, nothing committed unless asked.

---

## Self-Review Notes

- **Spec coverage:** all three approved items covered — 3-stop gradient (Task 1), static distant scenery (Task 2), day-only birds (Task 3) — and explicitly excludes the water/ocean, HUD redesign, and mixer-apparatus redesign the user confirmed were out of scope.
- **Placeholder scan:** no TBD/TODO; every step has complete, runnable code.
- **Type consistency:** `AmbientBirds`'s constructor/`destroy()` shape (Task 3) matches `AmbientFireflies`'s exactly (`constructor(scene, count?)`, `destroy(): void`), and `syncBirds()`'s if/else polarity (spawn when `!isNight`, destroy when `isNight`) is the deliberate inverse of `syncFireflies()`'s (spawn when `isNight`) — both call the same `dayNightSystem.isNight()` source of truth, so they can never both be active at once.
