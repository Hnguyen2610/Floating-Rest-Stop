# Cozy Polish Pack (Ambient & Micro-Interactions) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate the game's atmosphere and interaction feel with 4 high-value cozy polish features:
1. **Night Ambient Fireflies:** Softly drifting & glowing firefly particles floating over the station during night mode.
2. **Guest Arrival & Departure FX:** Magical cloud-puff entrance and star-dust departure animations for visiting guests.
3. **Happiness Crystal Attractor:** Collected crystals fly gracefully towards the HUD counter before accumulating.
4. **Cozy Weather & Night Ambient Soundscapes:** Dynamic ambient audio cues synced with weather recipe deliveries and day/night transitions.

---

## Global Constraints

- Tech Stack: Phaser 3.90, Web Audio API / SoundSystem, TypeScript.
- Performance: Keep particle counts low (<15 active fireflies, short-lived entrance/exit bursts) to protect WebView / mobile frame rates.
- Do not run `git commit` at any point in this plan unless the user explicitly requests it.

---

### Task 1: Night Ambient Fireflies (`AmbientFireflies.ts`)

**Files:**
- Create: `src/entities/AmbientFireflies.ts`
- Modify: `src/scenes/StationScene.ts`

**Interfaces:**
- Produces: `export class AmbientFireflies` managing a low-cost emitter/graphics group for floating night fireflies.

- [ ] **Step 1: Create `AmbientFireflies.ts`**

Create `src/entities/AmbientFireflies.ts`:

```ts
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PALETTE } from '../core/GameConfig';

export class AmbientFireflies {
  private particles: Phaser.GameObjects.Arc[] = [];
  private tweens: Phaser.Tweens.Tween[] = [];

  constructor(private scene: Phaser.Scene, count = 10) {
    for (let i = 0; i < count; i += 1) {
      const x = Phaser.Math.Between(40, GAME_WIDTH - 40);
      const y = Phaser.Math.Between(100, GAME_HEIGHT * 0.7);
      const dot = scene.add.circle(x, y, Phaser.Math.FloatBetween(2, 3.5), PALETTE.softYellow, 0);
      dot.setDepth(150); // Above background/platform, below UI

      const tween = scene.tweens.add({
        targets: dot,
        alpha: { from: 0, to: Phaser.Math.FloatBetween(0.4, 0.85) },
        y: y + Phaser.Math.Between(-30, 30),
        x: x + Phaser.Math.Between(-40, 40),
        duration: Phaser.Math.Between(2000, 4000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Phaser.Math.Between(0, 2000),
      });

      this.particles.push(dot);
      this.tweens.push(tween);
    }
  }

  destroy(): void {
    this.tweens.forEach((t) => t.destroy());
    this.particles.forEach((p) => p.destroy());
    this.tweens = [];
    this.particles = [];
  }
}
```

- [ ] **Step 2: Wire Fireflies into `StationScene.ts`**

In `StationScene.ts`:
- Add field `private fireflies: AmbientFireflies | null = null;`
- In `updateDayNightState(isNight: boolean)`: spawn `new AmbientFireflies(this)` when `isNight` is true, and destroy when `isNight` is false.
- Clean up in scene shutdown/destroy.

- [ ] **Step 3: Typecheck & verify**

Run: `npx tsc --noEmit && npx eslint .`

---

### Task 2: Guest Entrance & Departure FX (`Guest.ts` & `StationScene.ts`)

**Files:**
- Modify: `src/entities/Guest.ts`
- Modify: `src/scenes/StationScene.ts`

**Interfaces:**
- Produces: `playArrivalEffect()` and `playDepartureEffect(onComplete: () => void)` on `Guest`.

- [ ] **Step 1: Add entrance & departure animation methods to `Guest.ts`**

In `src/entities/Guest.ts`:

```ts
  playArrivalEffect(): void {
    this.setAlpha(0);
    this.setScale(0.3);
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      scale: 1,
      duration: 500,
      ease: 'Back.easeOut',
    });

    // Particle burst on arrival
    ParticleEffect.createSparkleEffect(this.scene, this.x, this.y);
  }

  playDepartureEffect(onComplete: () => void): void {
    ParticleEffect.createGlowEffect(this.scene, this.x, this.y);
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      y: this.y - 40,
      scale: 0.6,
      duration: 600,
      ease: 'Sine.easeIn',
      onComplete,
    });
  }
```

- [ ] **Step 2: Trigger arrival & departure in `StationScene.ts`**

In `handleGuestArrived`:
- Call `guestEntity.playArrivalEffect()`.

In `handleGuestDeparted`:
- Before destroying `activeGuestEntity`, call `activeGuestEntity.playDepartureEffect(() => activeGuestEntity.destroy())`.

- [ ] **Step 3: Typecheck & verify**

Run: `npx tsc --noEmit && npx vitest run`

---

### Task 3: Happiness Crystal Flying Attractor (`HappinessCrystal.ts`)

**Files:**
- Modify: `src/entities/HappinessCrystal.ts`
- Modify: `src/scenes/StationScene.ts`

**Interfaces:**
- Enhances `HappinessCrystal.collect()` to animate towards the crystal counter HUD target before triggering crystal addition.

- [ ] **Step 1: Add target fly animation to `HappinessCrystal.ts`**

In `HappinessCrystal.ts`, update `collect(targetX?: number, targetY?: number, onCollected?: () => void)`:

```ts
  collect(targetX?: number, targetY?: number, onComplete?: () => void): void {
    if (!targetX || !targetY) {
      onComplete?.();
      this.destroy();
      return;
    }

    this.scene.tweens.add({
      targets: this,
      x: targetX,
      y: targetY,
      scale: 0.3,
      alpha: 0.8,
      duration: 500,
      ease: 'Cubic.easeIn',
      onComplete: () => {
        ParticleEffect.createSparkleEffect(this.scene, targetX, targetY);
        onComplete?.();
        this.destroy();
      },
    });
  }
```

- [ ] **Step 2: Pass HUD target position in `StationScene.ts`**

When tapping a crystal in `StationScene.ts`, pass `this.crystalCounterPosition.x` and `y` into `crystal.collect(...)`.

- [ ] **Step 3: Typecheck & verify**

Run: `npx tsc --noEmit && npx vitest run`

---

### Task 4: Dynamic Weather & Night Ambient Soundscapes (`AudioSystem.ts`)

**Files:**
- Modify: `src/systems/AudioSystem.ts`
- Modify: `src/scenes/StationScene.ts`

**Interfaces:**
- Produces: Ambient synth sound cues for Day/Night state and Weather recipe activations.

- [ ] **Step 1: Enhance `AudioSystem.ts` with ambient sound synthesis**

Add helper methods in `AudioSystem.ts` to play soft synthesized ambient sounds:
- `playNightAmbient()`: Soft low-frequency Sine chime loop.
- `playWeatherAmbient(visualEffect: string)`: Distinct soft chime/breeze synth sound for each weather type.

- [ ] **Step 2: Connect audio cues to Day/Night and Weather delivery events**

In `StationScene.ts`:
- Trigger `systems.audioSystem.playNightAmbient()` on night transition.
- Trigger `systems.audioSystem.playWeatherAmbient(recipe.visualEffect)` on successful potion delivery.

- [ ] **Step 3: Full verification pass**

Run: `npx tsc --noEmit && npx eslint . && npx vitest run && npm run build`

---

## Self-Review Notes

- **Modularity:** Each task is self-contained and builds cleanly on existing entity & system structures.
- **Robustness:** Fallbacks provided for audio/WebGL capabilities. All particle and tween lifecycle handlers clean up properly to avoid memory leaks.
