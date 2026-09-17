# Floating-Rest-Stop Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a mixed approach of improvements to Floating-Rest-Stop game covering visual/art, performance, user experience, and code quality while maintaining the existing cute kawaii aesthetic.

**Architecture:** Incremental improvements that build on existing Phaser 3 foundation, adding visual polish, performance optimizations, UX enhancements, and code quality improvements through focused, testable changes that maintain backward compatibility.

**Tech Stack:** Phaser 3, TypeScript, Vite, Vitest, ESLint, Prettier

## Global Constraints

- Maintain cute kawaii mobile game aesthetic with flat vector illustration, soft cel-shading
- Use established color palette: sky blue #a9d8f0, cream #fff6e5, warm white #fdfbf7, blush pink #f7c9d0, lavender #d9c9ec, mint #c8ede0, soft yellow #fdf2a4
- Use warm dark plum-brown #5b4a63 for outlines
- Preserve existing game mechanics and core gameplay loop
- All new assets must follow specified art style guidelines
- Performance optimizations must maintain 60fps on mid-range mobile devices
- Accessibility features are optional enhancements
- Code changes follow existing TypeScript and Phaser patterns
- All changes must be testable and maintain backward compatibility

---

### Task 1: Create Accessory Variations

**Files:**
- Create: `/d/Floating-Rest-Stop/public/assets/accessories/rainbow_ribbon_pink.png`
- Create: `/d/Floating-Rest-Stop/public/assets/accessories/rainbow_ribbon_lavender.png`
- Create: `/d/Floating-Rest-Stop/public/assets/accessories/star_clip_mint.png`
- Create: `/d/Floating-Rest-Stop/public/assets/accessories/star_clip_yellow.png`
- Create: `/d/Floating-Rest-Stop/public/assets/accessories/sunset_hat_pink.png`
- Create: `/d/Floating-Rest-Stop/public/assets/accessories/sunset_hat_mint.png`

**Interfaces:**
- Consumes: None (asset creation)
- Produces: New accessory PNG files following the established art style

- [ ] **Step 1: Create pink variation of rainbow_ribbon**
  - Duplicate `/d/Floating-Rest-Stop/public/assets/accessories/rainbow_ribbon.png`
  - Recolor using established pastel palette: blush pink #f7c9d0 as primary color
  - Maintain soft cel-shading, thick clean outline (#5b4a63), upper-left soft highlight
  - Save as `/d/Floating-Rest-Stop/public/assets/accessories/rainbow_ribbon_pink.png`

- [ ] **Step 2: Create lavender variation of rainbow_ribbon**
  - Duplicate `/d/Floating-Rest-Stop/public/assets/accessories/rainbow_ribbon.png`
  - Recolor using established pastel palette: lavender #d9c9ec as primary color
  - Maintain soft cel-shading, thick clean outline (#5b4a63), upper-left soft highlight
  - Save as `/d/Floating-Rest-Stop/public/assets/accessories/rainbow_ribbon_lavender.png`

- [ ] **Step 3: Create mint variation of star_clip**
  - Duplicate `/d/Floating-Rest-Stop/public/assets/accessories/star_clip.png`
  - Recolor using established pastel palette: mint #c8ede0 as primary color
  - Maintain soft cel-shading, thick clean outline (#5b4a63), upper-left soft highlight
  - Save as `/d/Floating-Rest-Stop/public/assets/accessories/star_clip_mint.png`

- [ ] **Step 4: Create yellow variation of star_clip**
  - Duplicate `/d/Floating-Rest-Stop/public/assets/accessories/star_clip.png`
  - Recolor using established pastel palette: soft yellow #fdf2a4 as primary color
  - Maintain soft cel-shading, thick clean outline (#5b4a63), upper-left soft highlight
  - Save as `/d/Floating-Rest-Stop/public/assets/accessories/star_clip_yellow.png`

- [ ] **Step 5: Create pink variation of sunset_hat**
  - Duplicate `/d/Floating-Rest-Stop/public/assets/accessories/sunset_hat.png`
  - Recolor using established pastel palette: blush pink #f7c9d0 as primary color
  - Maintain soft cel-shading, thick clean outline (#5b4a63), upper-left soft highlight
  - Save as `/d/Floating-Rest-Stop/public/assets/accessories/sunset_hat_pink.png`

- [ ] **Step 6: Create mint variation of sunset_hat**
  - Duplicate `/d/Floating-Rest-Stop/public/assets/accessories/sunset_hat.png`
  - Recolor using established pastel palette: mint #c8ede0 as primary color
  - Maintain soft cel-shading, thick clean outline (#5b4a63), upper-left soft highlight
  - Save as `/d/Floating-Rest-Stop/public/assets/accessories/sunset_hat_mint.png`

- [ ] **Step 7: Verify all assets follow style guide**
  - Check each new asset for: flat vector illustration, soft cel-shading, gentle rounded shapes
  - Verify thick clean outline uses warm dark plum-brown #5b4a63
  - Confirm upper-left soft highlight lighting
  - Ensure no harsh shadows, subtle sparkle accents if appropriate
  - Validate centered composition on plain solid white background

- [ ] **Step 8: Commit**
```bash
git add /d/Floating-Rest-Stop/public/assets/accessories/rainbow_ribbon_pink.png
git add /d/Floating-Rest-Stop/public/assets/accessories/rainbow_ribbon_lavender.png
git add /d/Floating-Rest-Stop/public/assets/accessories/star_clip_mint.png
git add /d/Floating-Rest-Stop/public/assets/accessories/star_clip_yellow.png
git add /d/Floating-Rest-Stop/public/assets/accessories/sunset_hat_pink.png
git add /d/Floating-Rest-Stop/public/assets/accessories/sunset_hat_mint.png
git commit -m "feat: create accessory color variations for visual enhancement"
```

### Task 2: Implement Basic Guest Animations

**Files:**
- Modify: `/d/Floating-Rest-Stop/src/guests/AuroraGuest.ts`
- Modify: `/d/Floating-Rest-Stop/src/guests/ButterflyGuest.ts`
- Modify: `/d/Floating-Rest-Stop/src/guests/CometGuest.ts`
- Modify: `/d/Floating-Rest-Stop/src/guests/LittleStarGuest.ts`
- Modify: `/d/Floating-Rest-Stop/src/guests/MoonGuest.ts`
- Modify: `/d/Floating-Rest-Stop/src/guests/SunGuest.ts`

**Interfaces:**
- Consumes: Phaser GameObject, TweenManager
- Produces: Animated guest entities with idle bobbing and blinking

- [ ] **Step 1: Add idle bobbing animation to AuroraGuest**
  - Import Tween from 'phaser'
  - In constructor or create method, add a repeating yoyo tween on y position: `this.scene.tweens.add({ targets: this, y: this.y - 5, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.inOut' })`
  - Ensure the tween is stored so it can be stopped if needed

- [ ] **Step 2: Add blinking animation (scale y briefly) to AuroraGuest**
  - Add a second tween for scaleY: `this.scene.tweens.add({ targets: this, scaleY: 0.9, duration: 200, yoyo: true, repeat: -1, delay: 3000, ease: 'Linear' })` (blink every 3 seconds)

- [ ] **Step 3: Apply similar animations to other guest types**
  - Copy the animation code to ButterflyGuest, CometGuest, LittleStarGuest, MoonGuest, SunGuest
  - Vary parameters slightly for each type to avoid uniformity (different bob heights, blink intervals)

- [ ] **Step 4: Ensure animations are paused when scene is paused**
  - Add listener for scene pause/resume to pause/resume tweens

- [ ] **Step 5: Test animations run smoothly**
  - Run the game and verify guests bob and blink at 60fps
  - Check no performance impact

- [ ] **Step 6: Commit**
```bash
git add /d/Floating-Rest-Stop/src/guests/AuroraGuest.ts
git add /d/Floating-Rest-Stop/src/guests/ButterflyGuest.ts
git add /d/Floating-Rest-Stop/src/guests/CometGuest.ts
git add /d/Floating-Rest-Stop/src/guests/LittleStarGuest.ts
git add /d/Floating-Rest-Stop/src/guests/MoonGuest.ts
git add /d/Floating-Rest-Stop/src/guests/SunGuest.ts
git commit -m "feat: add basic idle animations to guest entities"
```

### Task 3: Add Subtle Particle Effects for Interactions

**Files:**
- Create: `/d/Floating-Rest-Stop/src/utils/ParticleEffect.ts`
- Modify: `/d/Floating-Rest-Stop/src/scenes/StationScene.ts` (or wherever interactions occur)

**Interfaces:**
- Consumes: Phaser Scene, coordinates for effect
- Produces: Reusable particle effect manager for sparkles and glows

- [ ] **Step 1: Create ParticleEffect utility class**
  - Define class with static method `createSparkleEffect(scene: Phaser.Scene, x: number, y: number): void`
  - Inside method: create a particle emitter using `scene.add.particles('sparkle')` (assuming we have a sparkle particle image)
  - Since we don't have a sparkle asset yet, we'll create a simple white circle or use existing texture; for now, we can use a placeholder and note to create asset later
  - Set emitter properties: lifespan 800ms, speed 20, quantity 5, blendMode ADD, gravity 0
  - Emit burst at position, then destroy emitter after emission

- [ ] **Step 2: Create a simple sparkle particle asset (optional)**
  - If time, create a small white dot image in `/d/Floating-Rest-Stop/public/assets/particles/sparkle.png`
  - Otherwise, use a existing texture or draw a graphics circle

- [ ] **Step 3: Integrate particle effect into StationScene for guest interactions**
  - Import ParticleEffect
  - When a guest is interacted with (e.g., clicked), call `ParticleEffect.createSparkleEffect(this, guest.x, guest.y)`

- [ ] **Step 4: Add glow effect to happiness crystals when collected**
  - Similar approach but maybe use a different particle config (softer, larger)

- [ ] **Step 5: Test particle effects do not impact performance**
  - Verify that particle emitters are properly destroyed
  - Run game and trigger effects, ensure no lag

- [ ] **Step 6: Commit**
```bash
git add /d/Floating-Rest-Stop/src/utils/ParticleEffect.ts
git add /d/Floating-Rest-Stop/src/scenes/StationScene.ts
git commit -m "feat: add subtle particle effects for interactive feedback"
```

### Task 4: Implement Texture Atlasing for Sprite Sheets

**Files:**
- Modify: `/d/Floating-Rest-Stop/src/core/AssetRegistry.ts` (or where assets are loaded)
- Create: `/d/Floating-Rest-Stop/assets/textures/atlas.json` (or use TexturePacker-like tool; but we'll simulate by creating a meta file; actual atlas generation might be external; for plan we'll assume we generate atlas and update loading)

**Interfaces:**
- Consists of: Texture atlas image and JSON metadata
- Produces: Optimized asset loading with reduced draw calls

- [ ] **Step 1: Identify sprite sheets to atlas**
  - Survey assets in `/d/Floating-Rest-Stop/public/assets/` for small sprites that can be packed (e.g., accessories, small icons)
  - Exclude large backgrounds or unique assets

- [ ] **Step 2: Generate texture atlas using external tool (e.g., TexturePacker) or script**
  - For the plan, we'll assume we run a script that creates `atlas.png` and `atlas.json`
  - Output to `/d/Floating-Rest-Stop/public/assets/atlases/main_atlas.png` and `.json`

- [ ] **Step 3: Update AssetRegistry to load atlas**
  - Modify asset loading to use `this.load.atlas('main_atlas', 'assets/atlases/main_atlas.png', 'assets/atlases/main_atlas.json')`
  - Update references to individual sprites to use the atlas frame names

- [ ] **Step 4: Verify all sprites still display correctly**
  - Run game and check that accessories, icons, etc. appear as before

- [ ] **Step 5: Measure performance improvement (optional)**
  - Add debug text to show draw call count before/after if possible

- [ ] **Step 6: Commit**
```bash
git add /d/Floating-Rest-Stop/src/core/AssetRegistry.ts
git add /d/Floating-Rest-Stop/public/assets/atlases/main_atlas.png
git add /d/Floating-Rest-Stop/public/assets/atlases/main_atlas.json
git commit -m "perf: implement texture atlasing to reduce draw calls"
```

### Task 5: Add Lazy Loading for Off-Screen Assets

**Files:**
- Modify: `/d/Floating-Rest-Stop/src/scenes/PreloadScene.ts`
- Modify: `/d/Floating-Rest-Stop/src/scenes/StationScene.ts` (and other scenes as needed)

**Interfaces:**
- Consumes: Phaser Scene loader
- Produces: Assets loaded only when needed, reducing initial load time

- [ ] **Step 1: Identify assets that can be lazy-loaded**
  - Assets for scenes not immediately needed (e.g., JournalScene assets, rare accessories)
  - Assets that are only used under certain conditions

- [ ] **Step 2: Modify PreloadScene to load only essential assets**
  - Keep loading of core assets: main atlas, essential UI, default guests, etc.
  - Remove loading of JournalScene assets, rare accessory sets, etc.

- [ ] **Step 3: Implement lazy loading mechanism in StationScene**
  - When transitioning to JournalScene or when a rare accessory is needed, call `this.load.scenePlugin(...)` or simply `this.load.image(...)` and `this.load.start()`
  - Use Phaser's `load` methods to load assets on demand, then add to cache

- [ ] **Step 4: Ensure lazy-loaded assets are properly cached and available**
  - Test that after triggering load, assets are usable

- [ ] **Step 5: Add loading indicator for lazy loads (optional)**
  - Show a small spinner or progress bar when loading large lazy assets

- [ ] **Step 6: Test that initial load time decreases**
  - Measure time from start to first frame

- [ ] **Step 7: Commit**
```bash
git add /d/Floating-Rest-Stop/src/scenes/PreloadScene.ts
git add /d/Floating-Rest-Stop/src/scenes/StationScene.ts
git commit -m "perf: add lazy loading for off-screen assets to improve initial load time"
```

### Task 6: Optimize Physics Updates with Fixed Timestep

**Files:**
- Modify: `/d/Floating-Rest-Stop/src/core/GameSystems.ts` (or wherever physics update is called)

**Interfaces:**
- Consumes: Phaser World delta time
- Produces: Stable physics simulation independent of frame rate

- [ ] **Step 1: Review current physics update call**
  - Find where `this.physics.world.step()` or similar is called (Phaser 3 uses fixed timestep by default? Actually Phaser 3's physics world uses a fixed timestep internally, but we can ensure we're not overriding)

- [ ] **Step 2: Ensure physics uses fixed timestep**
  - In Phaser, the physics step is already fixed if using `this.physics.world.step()` manually; but if using `this.physics.world.update()` it's variable. We'll check and adjust.

- [ ] **Step 3: Implement manual fixed timestep if needed**
  - If not already, accumulate delta and step physics at fixed intervals (e.g., 1/60)
  - Example: 
    ```javascript
    let delta = 0;
    const fixedDt = 1/60;
    function update(time, delta) {
        delta += delta / 1000; // convert to seconds
        while (delta >= fixedDt) {
            this.physics.world.step(fixedDt);
            delta -= fixedDt;
        }
    }
    ```

- [ ] **Step 4: Add spatial hashing for collision optimization (if many bodies)**
  - Enable Phaser's quadtree for static bodies: `this.physics.world.setBounds()` and use `this.physics.add.collider` with appropriate options

- [ ] **Step 5: Test physics stability**
  - Run game and verify no tunneling or jitter

- [ ] **Step 6: Commit**
```bash
git add /d/Floating-Rest-Stop/src/core/GameSystems.ts
git commit -m "perf: optimize physics updates with fixed timestep and spatial hashing"
```

### Task 7: Implement Object Pooling for Frequently Instantiated Entities

**Files:**
- Create: `/d/Floating-Rest-Stop/src/utils/ObjectPool.ts`
- Modify: `/d/Floating-Rest-Stop/src/entities/HappinessCrystal.ts` (example)
- Modify: `/d/Floating-Rest-Stop/src/utils/ParticleEffect.ts` (if creating particles frequently)

**Interfaces:**
- Consumes: Class type, initial size
- Produces: Reusable instances to reduce garbage collection

- [ ] **Step 1: Create generic ObjectPool class**
  - Constructor takes a factory function that returns a new instance
  - Methods: `acquire()`, `release(instance)`, `resize(size)`
  - Internally maintains an array of available instances

- [ ] **Step 2: Apply to HappinessCrystal (if spawned frequently)**
  - Instead of `new HappinessCrystal(...)`, use `HappinessCrystalPool.acquire()`
  - When crystal is collected or removed, call `HappinessCrystalPool.release(crystal)`
  - Ensure crystal properties are reset on acquire

- [ ] **Step 3: Apply to ParticleEffect (if creating many emitters)**
  - Pool particle emitters or the effect objects themselves

- [ ] **Step 4: Test that pooling works and reduces GC pressure**
  - Monitor memory allocation (if possible) or just ensure no errors

- [ ] **Step 5: Commit**
```bash
git add /d/Floating-Rest-Stop/src/utils/ObjectPool.ts
git add /d/Floating-Rest-Stop/src/entities/HappinessCrystal.ts
git add /d/Floating-Rest-Stop/src/utils/ParticleEffect.ts
git commit -m "perf: implement object pooling for frequent entity instantiation"
```

### Task 8: Add FPS Monitor and Basic Profiling

**Files:**
- Create: `/d/Floating-Rest-Stop/src/utils/PerformanceMonitor.ts`
- Modify: `/d/Floating-Rest-Stop/src/core/Game.ts` (or a central scene)

**Interfaces:**
- Consumes: Game loop delta time
- Produces: On-screen FPS display and optional logging

- [ ] **Step 1: Create PerformanceMonitor class**
  - Tracks frames per second over a short window (e.g., 1 second)
  - Provides method `update(delta)` to call each frame
  - Provides method `draw()` to render FPS text (optional, can be disabled in production)

- [ ] **Step 2: Integrate into Game.ts or a debug scene**
  - Instantiate monitor in Game constructor
  - Call `monitor.update(delta)` in update loop
  - Optionally draw to screen if a debug flag is set

- [ ] **Step 3: Add logging of frame times to console (optional)**
  - Log average FPS every 5 seconds for developer insight

- [ ] **Step 4: Test that monitor does not impact performance significantly**
  - Ensure the monitoring itself is lightweight

- [ ] **Step 5: Commit**
```bash
git add /d/Floating-Rest-Stop/src/utils/PerformanceMonitor.ts
git add /d/Floating-Rest-Stop/src/core/Game.ts
git commit -m "perf: add FPS monitor and basic profiling for performance tracking"
```

### Task 9: Improve Touch Hitbox Sizes for Mobile

**Files:**
- Modify: `/d/Floating-Rest-Stop/src/entities/Guest.ts` (and other interactive entities)
- Modify: `/d/Floating-Rest-Stop/src/entities/Decoration.ts` (if applicable)
- Modify: `/d/Floating-Rest-Stop/src/entities/FloatingIngredient.ts`

**Interfaces:**
- Consumes: Phaser GameObject input handling
- Produces: Larger interactive areas for touch

- [ ] **Step 1: Increase hitbox area for guest interactions**
  - In Guest class, when setting up input, increase the hitbox to at least 48x48 pixels
  - Can do by setting `this.setSize(48, 48)` if using a sprite, or adjust the hitbox via `this.body.setSize()` if using physics
  - Ensure visual sprite remains centered; hitbox can be larger than sprite

- [ ] **Step 2: Apply similar hitbox enlargement to other interactive entities**
  - Decorations that can be tapped, ingredients that can be dragged, etc.

- [ ] **Step 3: Add visual feedback on touch (scale change)**
  - On pointerdown, scale sprite to 1.05; on pointerup, return to 1.0
  - Use Phaser's interactive events: `this.on('pointerdown', () => this.setScale(1.05));`

- [ ] **Step 4: Test on mobile emulator or actual device**
  - Verify that touch targets are easy to hit

- [ ] **Step 5: Commit**
```bash
git add /d/Floating-Rest-Stop/src/entities/Guest.ts
git add /d/Floating-Rest-Stop/src/entities/Decoration.ts
git add /d/Floating-Rest-Stop/src/entities/FloatingIngredient.ts
git commit -m "ux: improve touch hitbox sizes and add visual feedback for mobile"
```

### Task 10: Add Haptic Feedback for Mobile (where supported)

**Files:**
- Create: `/d/Floating-Rest-Stop/src/utils/HapticFeedback.ts`
- Modify: `/d/Floating-Rest-Stop/src/entities/Guest.ts` (and other interactive entities)

**Interfaces:**
- Consumes: Touch event
- Produces: Vibration feedback on supported devices

- [ ] **Step 1: Create HapticFeedback utility**
  - Check if `navigator.vibrate` exists
  - Function `triggerFeedback(duration: number = 50)` that calls `navigator.vibrate(duration)` if available

- [ ] **Step 2: Integrate into interactive entities**
  - Import HapticFeedback
  - On pointerdown (or click), call `HapticFeedback.triggerFeedback(50)` for a short tap

- [ ] **Step 3: Ensure feedback is subtle and not overused**
  - Maybe limit to certain interactions (e.g., confirming a action) to avoid annoyance

- [ ] **Step 4: Test on mobile browser that supports vibration**
  - Verify vibration occurs and is not too strong

- [ ] **Step 5: Commit**
```bash
git add /d/Floating-Rest-Stop/src/utils/HapticFeedback.ts
git add /d/Floating-Rest-Stop/src/entities/Guest.ts
git commit -m "ux: add haptic feedback for mobile interactions"
```

### Task 11: Implement Contextual Tooltip Hints for First-Time Interactions

**Files:**
- Create: `/d/Floating-Rest-Stop/src/utils/TooltipSystem.ts`
- Modify: `/d/Floating-Rest-Stop/src/scenes/StationScene.ts`
- Modify: `/d/Floating-Rest-Stop/src/core/Game.ts` (to store hint state)

**Interfaces:**
- Consumes: Entity type, interaction context
- Produces: Tooltip UI that appears once per entity type

- [ ] **Step 1: Create TooltipSystem class**
  - Manages which hints have been shown (stored in localStorage or game state)
  - Method `showHint(entityKey: string, text: string, x: number, y: number)` that creates a tooltip UI element if hint not yet shown
  - Tooltip is a small Phaser.GameObjects.Text with background, positioned near entity
  - Automatically hides after a few seconds or on next interaction

- [ ] **Step 2: Integrate into StationScene**
  - For each type of interactable entity (guest, decoration, etc.), when first created or on first interaction, check if hint shown
  - If not, show tooltip with relevant hint (e.g., "Tap guests to make them happy!")

- [ ] **Step 3: Store hint state in game state or localStorage**
  - So hints persist across sessions

- [ ] **Step 4: Design tooltip to match aesthetic**
  - Use pastel background, rounded corners, soft outline, compliant with style guide

- [ ] **Step 5: Test that hints appear only once per entity type**
  - Refresh and verify hints do not reappear

- [ ] **Step 6: Commit**
```bash
git add /d/Floating-Rest-Stop/src/utils/TooltipSystem.ts
git add /d/Floating-Rest-Stop/src/scenes/StationScene.ts
git add /d/Floating-Rest-Stop/src/core/Game.ts
git commit -m "ux: add contextual tooltip hints for first-time interactions"
```

### Task 12: Implement Achievement/Toast Notification System

**Files:**
- Create: `/d/Floating-Rest-Stop/src/ui/AchievementToast.ts`
- Modify: `/d/Floating-Rest-Stop/src/core/GameSystems.ts` (or where achievements are triggered)
- Modify: `/d/Floating-Rest-Stop/src/scenes/StationScene.ts`

**Interfaces:**
- Consumes: Achievement event data
- Produces: Toast notification that slides in and out

- [ ] **Step 1: Create AchievementToast UI component**
  - Extends Phaser.GameObjects.Container (or Sprite+Text)
  - Shows icon, title, brief description
  - Animates in from bottom, stays for 3 seconds, animates out
  - Uses style guide colors and fonts

- [ ] **Step 2: Define achievement triggers**
  - Examples: first guest served, collect 10 happiness crystals, decorate with 5 accessories, etc.
  - Implement logic in GameSystems or relevant systems to detect these conditions

- [ ] **Step 3: When achievement unlocked, instantiate AchievementToast**
  - Add to scene, manage queue if multiple achievements close together

- [ ] **Step 4: Ensure toasts do not block gameplay**
  - Position them in a non-intrusive area (e.g., top-center or bottom-center)

- [ ] **Step 5: Test achievement unlocking and toast display**
  - Verify toast appears, animates correctly, and does not affect performance

- [ ] **Step 6: Commit**
```bash
git add /d/Floating-Rest-Stop/src/ui/AchievementToast.ts
git add /d/Floating-Rest-Stop/src/core/GameSystems.ts
git add /d/Floating-Rest-Stop/src/scenes/StationScene.ts
git commit -m "ux: implement achievement/toast notification system for milestones"
```

### Task 13: Improve Save/Load UX with Clear Status Indicators

**Files:**
- Modify: `/d/Floating-Rest-Stop/src/services/save/LocalSaveProvider.ts`
- Modify: `/d/Floating-Rest-Stop/src/core/Platform.ts` (to call save with UI feedback)
- Modify: `/d/Floating-Rest-Stop/src/scenes/StationScene.ts` (to trigger save UI)

**Interfaces:**
- Consumes: Save request
- Produces: Visual feedback (saving... icon, success/checkmark)

- [ ] **Step 1: Add save status UI elements**
  - Create a small icon (e.g., floppy disk) that changes appearance during save
  - Or use a toast-style message: "Saving..." then "Saved!"

- [ ] **Step 2: Modify LocalSaveProvider to accept a callback for progress**
  - Or have it return a promise; UI shows pending until promise resolves

- [ ] **Step 3: In Platform.ts or Game.ts, when calling showSaveProvider.save(), show UI**
  - Disable save button during save to prevent double-saves
  - Show error UI if save fails

- [ ] **Step 4: Use established style for UI**
  - Pastel colors, soft outlines, consistent with rest of UI

- [ ] **Step 5: Test save flow on web and mobile**
  - Verify UI feedback appears correctly and save still works

- [ ] **Step 6: Commit**
```bash
git add /d/Floating-Rest-Stop/src/services/save/LocalSaveProvider.ts
git add /d/Floating-Rest-Stop/src/core/Platform.ts
git add /d/Floating-Rest-Stop/src/scenes/StationScene.ts
git commit -m "ux: improve save/load UX with clear status indicators"
```

### Task 14: Add Scalable UI Options (Font Size Adjustment)

**Files:**
- Create: `/d/Floating-Rest-Stop/src/ui/SettingsMenu.ts`
- Modify: `/d/Floating-Rest-Stop/src/core/Game.ts` (to store UI scale setting)
- Modify: various UI text elements to use scaling factor

**Interfaces:**
- Consumes: User preference
- Produces: UI elements rendered at larger scale for accessibility

- [ ] **Step 1: Create SettingsMenu UI**
  - Accessible from pause menu or main menu
  - Includes slider for UI scale (e.g., 80% to 120%)
  - Applies scaling factor to all UI text and possibly hitboxes

- [ ] **Step 2: Store setting in localStorage or game state**
  - Load on startup

- [ ] **Step 3: Implement scaling function**
  - Create utility `getUIScaledValue(baseValue)` that returns baseValue * uiScale
  - Apply to font sizes in Text objects, and optionally to UI element positions/sizes

- [ ] **Step 4: Test that UI scales correctly and remains usable**
  - Verify text does not overflow containers at max scale

- [ ] **Step 5: Commit**
```bash
git add /d/Floating-Rest-Stop/src/ui/SettingsMenu.ts
git add /d/Floating-Rest-Stop/src/core/Game.ts
git commit -m "ux: add scalable UI options for font size adjustment"
```

### Task 15: Extract Reusable Utility Functions from Large Files

**Files:**
- Modify: `/d/Floating-Rest-Stop/src/core/GameSystems.ts`
- Modify: `/d/Floating-Rest-Stop/src/scenes/StationScene.ts`
- Create: `/d/Floating-Rest-Stop/src/utils/GameMath.ts`
- Create: `/d/Floating-Rest-Stop/src/utils/EntityHelpers.ts`

**Interfaces:**
- Consumes: Common logic scattered in large files
- Produces: Focused utility modules

- [ ] **Step 1: Identify repeated code in GameSystems.ts**
  - E.g., distance calculations, angle helpers, entity lookup functions
  - Extract to GameMath.ts

- [ ] **Step 2: Identify repeated code in StationScene.ts**
  - E.g., guest interaction logic, decoration placement helpers
  - Extract to EntityHelpers.ts

- [ ] **Step 3: Create utility modules with pure functions**
  - Ensure they are testable and have no side effects

- [ ] **Step 4: Replace original code with calls to utilities**
  - Verify functionality unchanged

- [ ] **Step 5: Add JSDoc comments to new utility functions**
  - Describe parameters, return values, and usage

- [ ] **Step 6: Commit**
```bash
git add /d/Floating-Rest-Stop/src/core/GameSystems.ts
git add /d/Floating-Rest-Stop/src/scenes/StationScene.ts
git add /d/Floating-Rest-Stop/src/utils/GameMath.ts
git add /d/Floating-Rest-Stop/src/utils/EntityHelpers.ts
git commit -m "refactor: extract reusable utility functions from large files"
```

### Task 16: Add JSDoc Comments to Public Classes and Methods

**Files:**
- Modify: All TypeScript files created or modified in previous tasks
- Specifically: new utility classes, modified entity classes, etc.

**Interfaces:**
- Consumes: Codebase
- Produces: Improved documentation for developers

- [ ] **Step 1: Add JSDoc to ParticleEffect.ts**
  - Describe class purpose, method parameters, return types

- [ ] **Step 2: Add JSDoc to Guest animation methods**
  - Explain the bobbing and blinking behavior

- [ ] **Step 3: Add JSDoc to all new utility classes (ObjectPool, PerformanceMonitor, etc.)**
  - Follow JSDoc conventions: `@param`, `@returns`, `@description`

- [ ] **Step 4: Ensure existing public classes in modified files have JSDoc**
  - If missing, add

- [ ] **Step 5: Commit**
```bash
git add /d/Floating-Rest-Stop/src/utils/ParticleEffect.ts
git add /d/Floating-Rest-Stop/src/entities/Guest.ts
git add /d/Floating-Rest-Stop/src/utils/ObjectPool.ts
git add /d/Floating-Rest-Stop/src/utils/PerformanceMonitor.ts
git add /d/Floating-Rest-Stop/src/utils/HapticFeedback.ts
git add /d/Floating-Rest-Stop/src/utils/TooltipSystem.ts
git add /d/Floating-Rest-Stop/src/ui/AchievementToast.ts
git commit -m "docs: add JSDoc comments to public classes and methods"
```

### Task 17: Fix Existing Test Failures and Improve Test Coverage

**Files:**
- Modify: `/d/Floating-Rest-Stop/src/core/AssetRegistry.test.ts`
- Modify: `/d/Floating-Rest-Stop/src/core/EventBus.test.ts`
- Create: tests for new utilities

**Interfaces:**
- Consumes: Test suite
- Produces: Passing tests and higher coverage

- [ ] **Step 1: Run existing tests to see failures**
  - `npm test`

- [ ] **Step 2: Fix failing tests in AssetRegistry.test.ts and EventBus.test.ts**
  - Understand what's broken and correct

- [ ] **Step 3: Write tests for new utility classes**
  - Test ObjectPool acquire/release
  - Test ParticleEffect creation (mock Phaser scene)
  - Test PerformanceMonitor frame calculation

- [ ] **Step 4: Aim to increase coverage for core systems**
  - Add tests for GameSystems helpers that were extracted

- [ ] **Step 5: Ensure tests pass in CI-like environment**
  - Run full test suite

- [ ] **Step 6: Commit**
```bash
git add /d/Floating-Rest-Stop/src/core/AssetRegistry.test.ts
git add /d/Floating-Rest-Stop/src/core/EventBus.test.ts
git add /d/Floating-Rest-Stop/tests/utils/ObjectPool.test.ts
git add /d/Floating-Rest-Stop/tests/utils/ParticleEffect.test.ts
git add /d/Floating-Rest-Stop/tests/utils/PerformanceMonitor.test.ts
git commit -m "test: fix existing test failures and improve test coverage for new utilities"
```

### Task 18: Add ESLint Rules for Phaser-Specific Best Practices

**Files:**
- Modify: `/d/Floating-Rest-Stop/eslint.config.js`
- Create: `/d/Floating-Rest-Stop/.eslintrc.js` (if not exists) or modify existing

**Interfaces:**
- Consumes: ESLint configuration
- Produces: linting that catches Phaser anti-patterns

- [ ] **Step 1: Review current ESLint configuration**
  - Look at `.eslintrc.js` or `eslint.config.js`

- [ ] **Step 2: Add rules for common Phaser mistakes**
  - E.g., `no-unused-expressions` for forgetting to start tweens
  - `prefer-const` for variables that don't reassigned
  - Custom rule: ensure `this.scene.tweens.add()` is stored if needed to stop later
  - Rule: discourage large delta times in physics step (already covered by fixed timestep)

- [ ] **Step 3: Ensure config extends recommended TypeScript and plugin rules**
  - Possibly add `@typescript-eslint` and `eslint-plugin-phaser` if available (or create custom)

- [ ] **Step 4: Run ESLint on codebase and fix new errors**
  - Address any linting issues introduced by new rules

- [ ] **Step 5: Commit**
```bash
git add /d/Floating-Rest-Stop/eslint.config.js
git commit -m "lint: add ESLint rules for Phaser-specific best practices"
```

### Task 19: Add Pre-Commit Hooks for Linting and Formatting

**Files:**
- Create: `/d/Floating-Rest-Stop/.husky/pre-commit`
- Modify: `/d/Floating-Rest-Stop/package.json` (to add husky and lint-staged if needed)

**Interfaces:**
- Consumes: Git commit attempt
- Produces: Ensures linted and formatted code before commit

- [ ] **Step 1: Install husky and lint-staged as devDependencies**
  - `npm install --save-dev husky lint-staged`

- [ ] **Step 2: Configure lint-staged in package.json**
  - Run `eslint --fix` and `prettier --write` on staged files

- [ ] **Step 3: Enable husky hooks**
  - `npx husky install`
  - Add pre-commit hook that runs lint-staged

- [ ] **Step 4: Test that pre-commit hook works**
  - Try to commit a file with lint errors; should fail unless fixed

- [ ] **Step 5: Commit the hook configuration**
```bash
git add /d/Floating-Rest-Stop/package.json
git add /d/Floating-Rest-Stop/.husky/pre-commit
git commit -m "dev: add pre-commit hooks for linting and formatting"
```

### Task 20: Implement Dependency Injection Pattern for Services

**Files:**
- Modify: `/d/Floating-Rest-Stop/src/core/Platform.ts`
- Modify: `/d/Floating-Rest-Stop/src/services/save/LocalSaveProvider.ts`
- Modify: `/d/Floating-Rest-Stop/src/core/Game.ts` (to inject services)
- Create: `/d/Floating-Rest-Stop/src/core/ServiceContainer.ts` (optional)

**Interfaces:**
- Consumes: Service implementations
- Produces: Loose coupling and easier testing

- [ ] **Step 1: Refactor Platform to accept dependencies via constructor**
  - Instead of creating LocalSaveProvider internally, inject it
  - Example: `constructor(private saveProvider: SaveProvider) {}`

- [ ] **Step 2: Update Game.ts to instantiate services and pass to Platform**
  - Create SaveProvider instance, then pass to Platform constructor

- [ ] **Step 3: Apply similar injection to other services if any**
  - e.g., PlatformAdapter implementations

- [ ] **Step 4: Ensure backward compatibility if needed**
  - Provide default parameters for ease of migration

- [ ] **Step 5: Test that injection works and services function correctly**
  - Verify save/load still works with injected provider

- [ ] **Step 6: Commit**
```bash
git add /d/Floating-Rest-Stop/src/core/Platform.ts
git add /d/Floating-Rest-Stop/src/services/save/LocalSaveProvider.ts
git add /d/Floating-Rest-Stop/src/core/Game.ts
git commit -m "arch: implement dependency injection pattern for services"
```

### Task 21: Adopt Clearer Separation of Concerns: Entities, Systems, Services

**Files:**
- Modify: Existing files to ensure they follow the pattern
- Entities: data + basic behavior (already in `/src/entities`)
- Systems: game logic (in `/src/core/GameSystems.ts` and similar)
- Services: external interactions (in `/src/services`)

**Interfaces:**
- Consumes: Current code organization
- Produces: Better modularity

- [ ] **Step 1: Review current placement of logic**
  - Ensure entities only contain data and minimal behavior (e.g., update animation)
  - Ensure complex logic (guest AI, scoring) is in systems
  - Ensure file I/O, platform APIs are in services

- [ ] **Step 2: Move any misplaced logic**
  - E.g., if GameSystems.ts contains entity construction, move to factories or entities
  - If entities contain save logic, move to services

- [ ] **Step 3: Create clear interfaces if beneficial**
  - For systems, define interface that systems implement (optional)

- [ ] **Step 4: Update imports accordingly**
  - Ensure systems depend on entities and services, not vice versa inappropriately

- [ ] **Step 5: Commit**
```bash
git add /d/Floating-Rest-Stop/src/entities/Guest.ts
git add /d/Floating-Rest-Stop/src/core/GameSystems.ts
git add /d/Floating-Rest-Stop/src/services/platform/BrowserPlatformAdapter.ts
git commit -m "arch: adopt clearer separation of concerns: entities, systems, services"
```

### Task 22: Increase Unit Test Coverage for Core Mechanics and Systems

**Files:**
- Create: `/d/Floating-Rest-Stop/tests/core/GameSystems.test.ts`
- Create: `/d/Floating-Rest-Stop/tests/entities/Guest.test.ts`
- Modify: existing test files as needed

**Interfaces:**
- Consumes: Core logic
- Produces: Confidence in correctness

- [ ] **Step 1: Identify critical mechanics in GameSystems.ts**
  - E.g., scoring calculations, guest state updates, save logic

- [ ] **Step 2: Write unit tests for each function**
  - Use mocks for dependencies (Phaser objects, services)

- [ ] **Step 3: Write tests for Guest entity**
  - Test animation setup, hitbox properties, interaction methods

- [ ] **Step 4: Aim for 80%+ coverage on core files**
  - Use coverage tool to guide

- [ ] **Step 5: Ensure tests run quickly and reliably**
  - Avoid heavy Phaser initialization where possible; use mocks

- [ ] **Step 6: Commit**
```bash
git add /d/Floating-Rest-Stop/tests/core/GameSystems.test.ts
git add /d/Floating-Rest-Stop/tests/entities/Guest.test.ts
git commit -m "test: increase unit test coverage for core mechanics and systems"
```

### Task 23: Add End-to-End Testing Framework for Critical User Flows

**Files:**
- Create: `/d/Floating-Rest-Stop/tests/e2e/guest-interaction.test.ts`
- Create: `/d/Floating-Rest-Stop/tests/e2e/save-load.test.ts`
- Modify: `/d/Floating-Rest-Stop/package.json` (to add e2e test script if using a tool like Cypress or Playwright; but we can simulate with Vitest and jsdom? For simplicity, we'll note that we add basic e2e using Vitest and maybe a testing-library approach)

**Interfaces:**
- Consumes: User actions
- Produces: Confidence that core flows work

- [ ] **Step 1: Choose e2e testing approach**
  - Since we're using Vitest, we can use `@vitest/ui` or just write tests that simulate user interactions via Phaser's input system in a headless environment? Might be complex.
  - For the plan, we'll create simple end-to-end tests that mount the game in a jsdom-like environment and simulate clicks, then check state.

- [ ] **Step 2: Write test for guest interaction flow**
  - Boot game, simulate click on a guest, verify happiness increases, animation plays, etc.

- [ ] **Step 3: Write test for save/load flow**
  - Trigger save, reload, verify state restored

- [ ] **Step 4: Ensure tests run in CI**
  - Add script `"test:e2e": "vitest run --dir tests/e2e"`

- [ ] **Step 5: Commit**
```bash
git add /d/Floating-Rest-Stop/tests/e2e/guest-interaction.test.ts
git add /d/Floating-Rest-Stop/tests/e2e/save-load.test.ts
git add /d/Floating-Rest-Stop/package.json
git commit -m "test: add end-to-end testing framework for critical user flows"
```

## Success Criteria

### Visual/Art
- New accessories and variations follow established style guide
- Animations run smoothly at 60fps on target devices
- Particle effects enhance feedback without distraction
- Improved touch target visibility on mobile devices

### Performance
- Maintain 60fps on mid-range mobile devices
- Reduce load times by 20% through asset optimization
- No memory leaks detected during extended play sessions
- Stable frame rate during peak activity periods

### User Experience
- New players can understand core mechanics within 2 minutes
- Touch targets are easily accessible on mobile devices
- Accessibility options are discoverable and functional
- Feedback systems enhance rather than distract from gameplay

### Code Quality
- All new code follows established patterns and conventions
- Reduced complexity in large files (StationScene.ts, GameSystems.ts)
- Improved test coverage for critical systems
- Developer can onboard and make changes within 1 day

## Next Steps
Plan complete and saved to `/d/Floating-Rest-Stop/docs/superpowers/plans/2026-09-04-floating-rest-stop-improvements-plan.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**