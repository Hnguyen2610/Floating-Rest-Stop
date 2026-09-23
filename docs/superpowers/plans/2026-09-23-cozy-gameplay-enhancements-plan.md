# Cozy Gameplay Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 3 high-impact gameplay polish features to enhance immersion and interaction feel:
1. **Mixer UI Liquid Blending & Discovery Banner:** Dynamic liquid color blending inside the mixer bowl as ingredients are added, plus a celebration banner when a new recipe is discovered.
2. **Cloudy Thought Bubbles & Paper Boat Launch Animation:** Cute emotion bubbles & spin bounce when poking Cloudy, and a floating paper boat sailing into the sky when sending messages.
3. **Sustained Weather Environment Overlay:** A gentle, low-density 8–10s weather atmosphere (soft rain drops, floating aurora dust, drifting leaves) after a recipe delivery.

---

## Global Constraints

- Tech Stack: Phaser 3.90, TypeScript.
- Performance: Keep sustained weather overlays low-density (<12 active particles) to maintain high FPS on mobile/WebView platforms.
- Do not run `git commit` at any point in this plan unless the user explicitly requests it.

---

### Task 1: Mixer Liquid Blending & Recipe Discovery Celebration (`WeatherMixerUI.ts`, `WeatherSystem.ts`)

**Files:**
- Modify: `src/ui/WeatherMixerUI.ts`
- Modify: `src/systems/WeatherSystem.ts`
- Modify: `src/scenes/StationScene.ts`

**Interfaces:**
- Produces: `updateLiquidFill(ingredientIds: string[])` on `WeatherMixerUI` and recipe discovery tracking in `WeatherSystem`.

- [ ] **Step 1: Add liquid graphics blending to `WeatherMixerUI.ts`**

In `WeatherMixerUI.ts`:
- Add a `liquidGraphics: Phaser.GameObjects.Graphics` inside the mixer bowl.
- When `updateSlotIcons()` runs, calculate a blended fill color from the added ingredient definitions and animate the liquid height with a gentle wave/bubble effect.

- [ ] **Step 2: Add recipe discovery celebration in `WeatherSystem.ts` & `StationScene.ts`**

In `WeatherSystem.ts`:
- Track discovered recipes in save data / state (`discoveredRecipeIds: Set<string>`).
- Expose `isRecipeDiscovered(id: string): boolean` and mark discovered on craft.

In `StationScene.ts`:
- When a new recipe is brewed/delivered for the first time, trigger a discovery banner toast: `🎉 Công thức mới: [Ten Cong Thuc]!` with extra sparkle bursts.

- [ ] **Step 3: Typecheck & test**

Run: `npx tsc --noEmit && npx vitest run`

---

### Task 2: Cloudy Thought Bubbles & Paper Boat Launch FX (`Cloudy.ts`, `PaperBoatUI.ts`)

**Files:**
- Modify: `src/entities/Cloudy.ts`
- Modify: `src/ui/PaperBoatUI.ts`
- Modify: `src/scenes/StationScene.ts`

**Interfaces:**
- Produces: `playThoughtBubble()` on `Cloudy` and floating paper boat animation in `StationScene`.

- [ ] **Step 1: Add thought bubble & spin bounce in `Cloudy.ts`**

In `Cloudy.ts`:
- Add `playThoughtBubble()`: Spawns a soft cloud bubble text containing random cozy emojis (`❤️`, `💤`, `☀️`, `🌸`, `☁️`) that floats upward and fades out.
- Trigger on `poke` interaction along with `playHappyBounce()`.

- [ ] **Step 2: Add sailing paper boat animation in `StationScene.ts`**

In `StationScene.ts`:
- On `handlePaperBoatSent`: create a small paper boat graphic/emoji at the platform position (`x: GAME_WIDTH * 0.3, y: GAME_HEIGHT * 0.7`), tweening it along a gentle arc sailing up into the sky (`y: -50`) with trailing star sparkles before destroying it.

- [ ] **Step 3: Typecheck & test**

Run: `npx tsc --noEmit && npx eslint .`

---

### Task 3: Sustained Weather Environment Overlay (`ParticleEffect.ts`, `StationScene.ts`)

**Files:**
- Modify: `src/utils/ParticleEffect.ts`
- Modify: `src/scenes/StationScene.ts`

**Interfaces:**
- Produces: `ParticleEffect.createSustainedWeatherOverlay(scene: Phaser.Scene, visualEffect: string, durationMs = 8000): void`

- [ ] **Step 1: Implement `createSustainedWeatherOverlay` in `ParticleEffect.ts`**

In `ParticleEffect.ts`:
- Add static method `createSustainedWeatherOverlay(scene: Phaser.Scene, visualEffect: string, durationMs = 8000): void`.
- Spawns a slow continuous emitter (e.g. 1 particle every 600ms) over 8 seconds:
  - `drizzle`: gentle rain drops drifting down across the station.
  - `breeze`: floating leaves/green sparkles sweeping horizontally.
  - `starlight` / `aurora`: soft floating purple/mint dust drifting upward.
  - `comet`: occasional warm ember sparkles.
- Auto-destroys emitter after `durationMs`.

- [ ] **Step 2: Trigger sustained weather in `StationScene.ts`**

In `StationScene.ts` inside `handleGuestInteraction` on successful potion delivery:
- Call `ParticleEffect.createSustainedWeatherOverlay(this, recipe.visualEffect, 8000)`.

- [ ] **Step 3: Full verification pass**

Run: `npx tsc --noEmit && npx eslint . && npx vitest run && npm run build`

---

## Self-Review Notes

- **Modularity:** Enhancements build directly upon existing UI, entity, and particle system patterns.
- **Performance:** Sustained weather overlay uses low emission rate (frequency 600ms) to ensure lightweight CPU/GPU footprint.
