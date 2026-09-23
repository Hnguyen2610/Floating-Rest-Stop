# Technical & UX Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 4 core technical, architectural, and UX enhancements to maximize stability, persistence, and polish:
1. **Smooth Camera Scene Transitions:** Subtle fade-in / fade-out camera transitions between `StationScene` and `JournalScene`.
2. **Audio Settings Persistence:** Store user's volume levels (Master/Music/SFX/Ambience) and mute state in `SaveSystem` across sessions.
3. **Desktop Accessibility & Shortcuts:** Bind `ESC` to dismiss open UI panels / return to main scene and `Space` to interact with guests.
4. **Cozy Preloader Progress Bar:** A pastel cloud progress bar in `PreloadScene` for seamless loading feedback.

---

## Global Constraints

- Tech Stack: Phaser 3.90, TypeScript, SaveSystem.
- Backward Compatibility: Ensure `SaveSystem` handles save migration for saves missing `audioSettings` gracefully.
- Do not run `git commit` at any point in this plan unless the user explicitly requests it.

---

### Task 1: Audio Settings Persistence (`SaveSystem.ts`, `AudioSystem.ts`)

**Files:**
- Modify: `src/types/save.ts`
- Modify: `src/systems/SaveSystem.ts`
- Modify: `src/systems/AudioSystem.ts`
- Modify: `src/scenes/PreloadScene.ts`

**Interfaces:**
- Consumes/Produces: `AudioSettingsSave` interface on `SaveData`.

- [ ] **Step 1: Add `AudioSettingsSave` to `SaveData` interface in `src/types/save.ts`**

```ts
export interface AudioSettingsSave {
  muted: boolean;
  masterVolume: number;
  busVolumes: Record<string, number>;
}

// Add optional audioSettings field to SaveData
```

- [ ] **Step 2: Update `AudioSystem.ts` to export & restore settings state**

In `src/systems/AudioSystem.ts`:
- Add `getSettingsSave(): AudioSettingsSave`
- Add `restoreSettings(settings: Partial<AudioSettingsSave>): void`

- [ ] **Step 3: Wire into `SaveSystem.ts` & `PreloadScene.ts`**

In `SaveSystem.ts`:
- Include `audioSettings` in `serializeState()`.

In `PreloadScene.ts`:
- Restore audio settings on system initialization: `systems.audioSystem.restoreSettings(saveData.audioSettings)`.

- [ ] **Step 4: Typecheck & test**

Run: `npx tsc --noEmit && npx vitest run`

---

### Task 2: Smooth Camera Scene Transitions (`StationScene.ts`, `JournalScene.ts`)

**Files:**
- Modify: `src/scenes/StationScene.ts`
- Modify: `src/scenes/JournalScene.ts`

**Interfaces:**
- Produces: Smooth 300ms fade-in on `create()` and fade-out on scene transitions.

- [ ] **Step 1: Add camera fade in `StationScene.ts`**

In `StationScene.ts`:
- On `create()`: `this.cameras.main.fadeIn(300, 255, 255, 255);`
- When transitioning to `JournalScene`:
  ```ts
  this.cameras.main.fadeOut(300, 255, 255, 255, (_cam, progress) => {
    if (progress === 1) this.scene.start('JournalScene');
  });
  ```

- [ ] **Step 2: Add camera fade in `JournalScene.ts`**

In `JournalScene.ts`:
- On `create()`: `this.cameras.main.fadeIn(300, 255, 255, 255);`
- When clicking back:
  ```ts
  this.cameras.main.fadeOut(300, 255, 255, 255, (_cam, progress) => {
    if (progress === 1) this.scene.start('StationScene');
  });
  ```

- [ ] **Step 3: Typecheck & test**

Run: `npx tsc --noEmit && npx eslint .`

---

### Task 3: Desktop Shortcuts & ESC Key Navigation (`StationScene.ts`, `JournalScene.ts`)

**Files:**
- Modify: `src/scenes/StationScene.ts`
- Modify: `src/scenes/JournalScene.ts`

**Interfaces:**
- Listens for `ESC` and `SPACE` keyboard events to close UI panels or trigger guest interaction.

- [ ] **Step 1: Add ESC and SPACE handlers in `StationScene.ts`**

In `StationScene.ts`:
- Add `ESC` listener: Closes active UI modal if open (`recipeBookUI`, `audioSettingsUI`, `stationAreaShopUI`, `cloudyCosmeticsShopUI`, `welcomeGuideUI`).
- Add `SPACE` listener: Triggers tap interaction on active guest (`handleGuestInteraction({ type: 'tap' })`).

- [ ] **Step 2: Add ESC handler in `JournalScene.ts`**

In `JournalScene.ts`:
- Add `ESC` listener: Triggers back transition to `StationScene`.

- [ ] **Step 3: Typecheck & test**

Run: `npx tsc --noEmit && npx vitest run`

---

### Task 4: Preloader Progress Bar UI (`PreloadScene.ts`)

**Files:**
- Modify: `src/scenes/PreloadScene.ts`

**Interfaces:**
- Produces: Pastel progress bar with cloud icon updated via `this.load.on('progress', ...)`

- [ ] **Step 1: Implement progress bar graphics in `PreloadScene.ts`**

In `PreloadScene.ts`:
- Draw centered background bar & fill bar (`PALETTE.mint` / `PALETTE.cloudWhite`).
- Update fill width on `progress` event:
  ```ts
  this.load.on('progress', (value: number) => {
    progressBar.clear();
    progressBar.fillStyle(0x6fcf97, 1);
    progressBar.fillRoundedRect(x, y, width * value, height, 6);
  });
  ```
- Destroy loading UI elements when loading completes before transitioning to `initialize()`.

- [ ] **Step 2: Full verification pass**

Run: `npx tsc --noEmit && npx eslint . && npx vitest run && npm run build`

---

## Self-Review Notes

- **Save Migration:** `restoreSettings` checks for undefined/null fields gracefully.
- **UI Safety:** ESC key checks panel visibility flags before closing to avoid unintended states.
