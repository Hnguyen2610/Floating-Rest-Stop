# Squash & Stretch Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add squash/stretch feedback to three interaction moments that currently have none: Cloudy reacting to *every* successful potion delivery (today only Butterfly's arrival triggers a bounce), a distinct "no, wrong one" shake on a guest when the wrong potion is delivered (today identical to a correct tap), and a small scale pop on decorations when chimed (today angle-only).

**Architecture:** All three additions reuse the existing tween-chain pattern already proven in this codebase (`Cloudy.playHappyBounce()`, `Cloudy.playGlanceAtGuest()`) — no new classes, no new state, just new methods on `Guest`/`Decoration` plus two new call sites in `StationScene.handleGuestInteraction()`. Every new tween on `Cloudy`/`Guest` targets only `angle`/`scaleX`/`scaleY`, never `x`/`y` — both classes recompute `x`/`y` from `baseX`/`baseY` every frame in `update()`, so a tween touching either would be silently overwritten next frame (documented in-place in both files already; this plan follows the same rule).

**Tech Stack:** Phaser 3.90 tweens (`scene.tweens.add`/`scene.tweens.chain`), TypeScript.

## Global Constraints

- Never tween `x`/`y` on `Cloudy` or `Guest` — both overwrite them every frame in `update()`. Only `angle`, `scale`, `scaleX`, `scaleY`, `alpha` are safe.
- No new texture assets, no new config constants needed — every value here is a small literal tuned by eye, following the same convention as the existing `playHappyBounce()`/`playTapAcknowledge()` tweens.

---

### Task 1: Cloudy reacts to every successful potion delivery

**Files:**
- Modify: `src/scenes/StationScene.ts:633-670` (`handleGuestInteraction`)

**Interfaces:**
- Consumes: `Cloudy.playHappyBounce(): void` (already exists, `src/entities/Cloudy.ts:100`) and a new `Guest.playRejectShake(): void` from Task 2.
- Produces: nothing new consumed elsewhere.

- [ ] **Step 1: Add the Cloudy reaction on success, and call the (not-yet-written) reject shake on failure**

Open `src/scenes/StationScene.ts` and replace the `handleGuestInteraction` method (currently lines 633-670):

```ts
  private handleGuestInteraction(interaction: GuestInteraction): void {
    const treatment = this.systems.guestSystem.getPreferredTreatment();
    if (!treatment) return;

    if (treatment.type === 'recipe' && interaction.type === 'tap') {
      const potionId = this.systems.weatherSystem.usePotion();
      if (!potionId) {
        // "Tap gently → nghe chuyện": a tap that isn't priming a potion would
        // otherwise do nothing — for Butterfly mid-chat, turn it into a story instead.
        this.tellButterflyStoryIfReady();
        return;
      }
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
        // Cloudy celebrates every correct delivery, not just Butterfly's
        // arrival (the only existing playHappyBounce() call site before this).
        this.cloudy.playHappyBounce();
      } else {
        // Wrong potion for this guest — previously silent (no feedback at
        // all beyond the generic tap acknowledgment every tap already gets).
        this.activeGuestEntity?.playRejectShake();
      }
      return;
    }

    if (treatment.type === 'direct' && interaction.type === 'rub') {
      this.systems.guestSystem.soothe(Math.min(interaction.distance, 15) * 0.1);
      this.playPolishSoundThrottled();
      // Add subtle sparkle effect for rub interaction
      if (this.activeGuestEntity) {
        ParticleEffect.createSparkleEffect(this, this.activeGuestEntity.x, this.activeGuestEntity.y);
      }
    }
  }
```

- [ ] **Step 2: Typecheck (expect an error — `playRejectShake` doesn't exist yet)**

Run: `npx tsc --noEmit`
Expected: FAIL — `Property 'playRejectShake' does not exist on type 'Guest'`. Confirms the call site is wired; Task 2 implements the method. Continue to Task 2 before verifying this file again.

---

### Task 2: `Guest.playRejectShake()` — the "no, wrong one" cue

**Files:**
- Modify: `src/entities/Guest.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: `playRejectShake(): void`, called by Task 1's `StationScene.handleGuestInteraction()`.

- [ ] **Step 1: Add the method**

In `src/entities/Guest.ts`, add `playRejectShake()` right after `playRelief()` (currently lines 156-164):

```ts
  protected playRelief(): void {
    this.scene.tweens.add({
      targets: this,
      scale: 1.12,
      duration: 160,
      yoyo: true,
      ease: 'Sine.easeOut',
    });
  }

  // "No, not that one" cue for a wrong-potion tap — angle-only, same reason
  // as Cloudy.playGlanceAtGuest(): update() rewrites x/y from baseX/baseY
  // every frame, so tweening either here would just get overwritten on the
  // next frame. A quick head-shake reads clearly at guest scale without
  // needing a new sprite or texture.
  playRejectShake(): void {
    this.scene.tweens.chain({
      targets: this,
      tweens: [
        { angle: -8, duration: 60, ease: 'Sine.easeOut' },
        { angle: 8, duration: 100, ease: 'Sine.easeInOut' },
        { angle: -5, duration: 90, ease: 'Sine.easeInOut' },
        { angle: 0, duration: 80, ease: 'Sine.easeOut' },
      ],
    });
  }
```

- [ ] **Step 2: Typecheck, lint, test**

Run: `npx tsc --noEmit && npx eslint . && npx vitest run`
Expected: all clean (tsc now passes since `playRejectShake` exists; no test changes needed — this codebase has no entity/animation unit tests, verified visually instead, see Task 4).

- [ ] **Step 3: Commit reminder**

Do **not** run `git commit` unless the user asks for it in this session.

---

### Task 3: Decoration gets a scale pop alongside its existing chime wiggle

**Files:**
- Modify: `src/entities/Decoration.ts:140-149` (`playChime`)

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing consumed elsewhere — `playChime()` is already wired to `pointerdown` in `wireInteraction()` (line 137).

- [ ] **Step 1: Add scaleX/scaleY to the existing tween**

Open `src/entities/Decoration.ts` and replace `playChime()` (currently lines 140-149):

```ts
  private playChime(): void {
    this.onChime?.();
    this.scene.tweens.add({
      targets: this,
      angle: 12,
      scaleX: 1.08,
      scaleY: 1.08,
      duration: 100,
      yoyo: true,
      repeat: 2,
      ease: 'Sine.easeInOut',
    });
    for (let i = 0; i < 3; i += 1) {
      const dot = this.scene.add.circle(this.x, this.y - 10, 3, 0xffffff, 0.9);
      this.scene.tweens.add({
        targets: dot,
        y: dot.y - 20 - i * 6,
        x: dot.x + (i - 1) * 10,
        alpha: 0,
        duration: 500,
        onComplete: () => dot.destroy(),
      });
    }
  }
```

(Only the first `tweens.add` call changes — the sparkle-dot loop below it is unchanged.) Adding `scaleX`/`scaleY` here is safe: `Decoration` never overrides `update()` to recompute its own transform (unlike Cloudy/Guest), and by the time a player can tap it, its one-shot spawn-in tween — `scene.tweens.add({ targets: this, scale: 1, duration: 300, ease: 'Back.easeOut' })` at construction (line 43) — has long finished, so there's no competing tween on `scaleX`/`scaleY` to fight with.

- [ ] **Step 2: Typecheck, lint, test**

Run: `npx tsc --noEmit && npx eslint . && npx vitest run`
Expected: all clean.

---

### Task 4: Full verification pass

**Files:** none (verification only).

- [ ] **Step 1: Run the full local check suite**

Run: `npx tsc --noEmit && npx vitest run && npx eslint . && npm run build`
Expected: all four commands exit clean (0).

- [ ] **Step 2: Manual/Playwright pass on the running game**

With `npm run dev` running, drive the game (dev-only keys documented in `StationScene.ts`'s `wireDebugKeys`-equivalent block, e.g. `1`/`2`/`3`/`4`/`5`/`6` to spawn a guest, `q` to clear):
- Brew and deliver the *correct* potion to a guest → confirm Cloudy now visibly bounces (squash/stretch + happy expression) on every guest type, not just Butterfly.
- Brew and deliver a *wrong* potion (any potion that doesn't match the guest's current `treatment.recipeId`) → confirm the guest does a quick head-shake wiggle instead of nothing.
- Tap a wind chime / any interactive decoration → confirm it now visibly pops (slightly bigger) on each chime bounce, not just tilts.
- Confirm no console errors during any of the above.

- [ ] **Step 3: Report status**

Summarize to the user: all checks passing, three new feedback moments confirmed working visually, nothing committed unless asked.

---

## Self-Review Notes

- **Spec coverage:** all three approved items covered — Cloudy bounce on every successful delivery (Task 1), correct/incorrect tap distinction via `playRejectShake()` (Tasks 1-2), decoration chime scale pop (Task 3).
- **Placeholder scan:** no TBD/TODO; every step has complete code.
- **Type consistency:** `Guest.playRejectShake(): void` (Task 2) matches its call site `this.activeGuestEntity?.playRejectShake()` (Task 1) — `activeGuestEntity` is typed `Guest | null` in `StationScene.ts`, and `playRejectShake` is declared on the `Guest` base class, so it's available on every concrete guest subclass without further changes.
