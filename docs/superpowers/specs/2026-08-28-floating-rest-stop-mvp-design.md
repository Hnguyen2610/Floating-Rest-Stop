# Floating Rest Stop (Trạm Dừng Chân Lơ Lửng) — MVP Design

Date: 2026-08-28
Status: Approved for implementation

## 1. Product Summary

A cozy, non-competitive management/healing sim. The player is **Cloudy (Mây Bông)**, a small
floating cloud running a rest stop that drifts through the sky. Sky-dwelling guests (Sun, Moon,
Little Star) arrive stressed/tired/lonely/insecure; the player observes their emotional state,
gathers weather ingredients, crafts a Weather Potion, and soothes the guest until they relax and
become happy. Relaxed/happy guests produce **Happiness Crystals**, used to unlock decorations and
content. Special relaxed states can trigger a **Photo Moment**, captured into the **Sky Journal**,
which also unlocks lore/diary text as guests are revisited over time.

Core loop philosophy: **Observe → Understand → Interact → Soothe → Remember.**
Explicitly not a restaurant sim: no combat, no HP, no game over, no countdown timers, no
leaderboards, no score-based feedback (numbers are never shown to the player directly — emotional
state is always communicated through animation/color/particles/dialogue).

Full product vision, art direction, audio direction, and per-character personality/dialogue intent
are as specified in the original product brief (see project conversation history / issue). This
document focuses on the **technical architecture and MVP scope** needed to implement it.

## 2. MVP Scope

Building the full 14-pass MVP roadmap (Section 8 below) as one vertical slice, in order, each pass
build-and-tested before moving to the next. In scope:

- 1 playable character: Cloudy, with soft-body drag interaction.
- 3 guests: Sun, Moon, Little Star — each with distinct personality, preferred treatment, and
  interaction style, but sharing one generic emotion/progression system.
- 5 weather ingredients, 3 weather recipes (data-driven).
- Happiness Crystal economy feeding into 5 decorations (predefined slots, not free placement).
- Photo Moment → Sky Journal (metadata-only, no captured images — see Section 6.4).
- Emotional progression across visits (visit count / trust level / unlocked memories persist).
- Local save/load via an abstracted `SaveProvider`.
- All visuals as Phaser Graphics/particle placeholders (pastel, soft, rounded) — no external art
  assets, no copyrighted material.

Explicitly out of scope for this MVP: backend/accounts, multiplayer, real art/audio assets, actual
YouTube Playables integration (only architected so it can be added later without gameplay
rewrites), free-form decoration placement, procedural dialogue.

## 3. Tech Stack & Tooling

| Concern | Choice | Notes |
|---|---|---|
| Engine | **Phaser 3.90.0** (exact pin, no `^`/`~`) | Verified via `npm view phaser versions` — 3.90.0 is the newest published 3.x release. npm's `latest` dist-tag now points to Phaser 4 (4.2.1), which is **not** used here per product brief's explicit Phaser 3 requirement. Pinning exact avoids an incidental major-version bump on a future `npm install`. |
| Language | TypeScript, strict mode | No `any` without justification. |
| Build | Vite | Dev server + HMR + production build. |
| Unit tests | Vitest | For pure-logic Systems (EmotionSystem transitions, WeatherSystem recipe resolution, ProgressionSystem, SaveSystem serialization) that don't need a live Phaser/canvas context. |
| Lint/format | ESLint (typescript-eslint) + Prettier | Pass 14 QA requirement. |
| Package manager | npm | `npm install` / `npm run dev` / `npm run build` are the Pass 1 acceptance gates. |

Before scaffolding, consult Context7 for current Phaser 3 + Vite + TypeScript project-setup
guidance rather than relying on training data, per project convention.

## 4. UI Rendering Approach — Phaser-native

**Decision: all UI (dialogue box, crystal counter, inventory, weather mixer, journal cards, debug
panel) is built from Phaser GameObjects (Container/Graphics/BitmapText/Rectangle hit areas), not a
DOM overlay.**

Rationale:
- A single render tree keeps `game.renderer.snapshot()`-style canvas capture straightforward if a
  real Photo Moment screenshot feature is ever added later (kept as a documented future option,
  not implemented in MVP — see Section 6.4).
- YouTube Playables environments are commonly sandboxed iframes with limited/unreliable DOM
  styling guarantees outside the canvas; an all-canvas UI avoids that risk entirely.
- Trade-off accepted: rich text layout and screen-reader accessibility are harder than with DOM.
  Not a concern for this MVP's target experience.

Debug-only dev panel (Section 32 of brief) may use a minimal DOM overlay since it is stripped from
production builds and has no bearing on Playables compatibility.

## 5. Core Architecture

### 5.1 Scenes vs. Systems

Scenes are composition/lifecycle/input-routing only: `BootScene`, `PreloadScene`, `StationScene`,
`JournalScene`, `DecorationScene`. No scene should grow into a multi-thousand-line god file — if a
scene's responsibilities grow, extract a System.

Systems hold gameplay/business logic and are instantiated once per `Game` (not per-Scene):
`GuestSystem`, `EmotionSystem`, `WeatherSystem`, `IngredientSystem`, `InteractionSystem`,
`HappinessSystem`, `ProgressionSystem`, `DecorationSystem`, `PhotoMomentSystem`, `JournalSystem`,
`SaveSystem`, `AudioSystem`.

### 5.2 EventBus discipline

EventBus is for **domain events / broadcast notifications** — things that happened, which zero or
more other systems/UI may care about, where the emitter shouldn't need to know who's listening:

```
GUEST_ARRIVED, GUEST_EMOTION_CHANGED, GUEST_LEFT, INGREDIENT_COLLECTED, WEATHER_CREATED,
WEATHER_USED, GUEST_RELAXED, HAPPINESS_SPAWNED, HAPPINESS_COLLECTED, DECORATION_UNLOCKED,
DECORATION_PLACED, PHOTO_MOMENT_AVAILABLE, PHOTO_CAPTURED, MEMORY_UNLOCKED, SAVE_COMPLETED
```

**EventBus is not mandatory for every inter-system interaction.** When System A needs to *query*
or *command* System B and expects a direct answer/result, use a normal method call via constructor
injection — do not invent request/response event pairs (no `WEATHER_QUERY_REQUESTED` /
`WEATHER_QUERY_RESULT` style event soup). Examples of direct calls:

- `InteractionSystem` calls `WeatherSystem.tryCraft(recipeId, ingredients): CraftResult` directly.
- `EmotionSystem` calls `HappinessSystem.spawnCrystal(guestId, position)` directly when a
  relax/happy threshold is crossed (then `HappinessSystem` emits `HAPPINESS_SPAWNED` for UI/FX to
  react to).
- `ProgressionSystem` reads guest history directly from `SaveSystem`'s in-memory `SaveData`.

Rule of thumb: **event = "this happened, react if you care"; direct call = "I need you to do
something / tell me something now."**

### 5.3 Data-driven content

`guests.json`, `emotions.json`, `ingredients.json`, `recipes.json`, `decorations.json`,
`journal.json` are loaded via Phaser's JSON loader in `PreloadScene` and parsed into typed
structures (`types/`). `WeatherSystem` resolves a recipe by matching the submitted ingredient set
against `recipes.json` entries — no if/else chains keyed by recipe name.

### 5.4 Guest emotion & lifecycle model

Two small, independent, data-driven state dimensions per guest (chosen over a single flat FSM so
that per-visit lifecycle and cross-visit emotional progression — Section 17 of the brief — don't
get conflated):

- **VisitStage** (resets every visit): `ARRIVING → PRESENT → LEAVING`.
- **EmotionStage** (derived from `emotionalIntensity: number` 0–100 via thresholds declared in
  `emotions.json`, persisted/partially-carried across visits per Section 17): `DISTRESSED →
  CALMING → RELAXED → HAPPY`.

`Guest` data shape (generic, no per-guest subclassing of this logic):

```ts
interface Guest {
  id: string;                 // "sun" | "moon" | "little_star" | future ids
  currentEmotion: EmotionId;  // e.g. "OVERHEATED", "LONELY", "INSECURE" — a data label, not a state node
  emotionalIntensity: number; // 0 (fully relaxed) – 100 (fully distressed); never shown to player
  visitStage: VisitStage;
  visitCount: number;
  trustLevel: number;
  unlockedMemories: string[];
}
```

`guests/SunGuest.ts`, `MoonGuest.ts`, `LittleStarGuest.ts` supply only **visual presentation**
(rays/glow/craters/twinkle), **idle animation**, and **interaction adapters** (e.g. Little Star's
gentle-rub gesture vs. Sun/Moon's potion-application). They do not implement their own copy of the
emotion/progression state machine.

### 5.5 Soft-body physics (Cloudy)

Control-point mesh (8–12 points around the blob outline) with per-point spring-damper physics.
Pointer drag moves the nearest point toward the pointer; neighboring points are pulled
proportionally to distance (falloff by `influenceRadius`); on release, points spring back via
`stiffness`/`damping`; `stretchLimit` caps max displacement; `returnSpeed` scales the settle rate.
All five parameters live in one config object in `GameConfig.ts`, not hardcoded in `Cloudy.ts`, so
game-feel can be tuned without touching interaction code.

### 5.6 Save system

```ts
interface SaveProvider {
  load(): Promise<SaveData | null>;
  save(data: SaveData): Promise<void>;
}
```

Async from the start (not sync-then-later-refactored), because a future
`YouTubePlayablesSaveProvider` wraps the Playables SDK's async `loadData()`/`saveData()` calls, and
that SDK requires the initial load to complete before any save is attempted (a save issued before
load resolves is rejected).

`LocalSaveProvider` wraps `localStorage` access in a resolved/rejected `Promise` (same interface,
synchronous storage underneath). `SaveSystem` owns a `ready: Promise<void>` gate: it awaits
`provider.load()` once at startup before hydrating systems, and refuses/queues autosave writes
issued before that gate resolves.

`SaveData` persists: happiness crystals, unlocked decorations, placed decorations, guest
progression (per Section 5.4 fields), journal entries, unlocked photo memories (see 6.4), visit
counts, and settings (volume levels, mute). Player cosmetics are out of MVP scope (Section 2) and
are not part of the MVP `SaveData` shape — added only if/when a cosmetics feature is built.

### 5.7 Photo Moment / Sky Journal — no binary data in save

**Decision: the progression save never contains a screenshot, canvas capture, or base64 image.**
Reasons: localStorage quota is small and synchronous; base64-encoded images bloat save size fast
across dozens of Photo Moments; a future YouTube Playables cloud save is capped at 3 MiB total, and
burning that budget on encoded images would be a bad trade for a save that's otherwise just small
JSON.

```ts
interface PhotoMemory {
  photoMomentId: string; // e.g. "sun_cool_drizzle_01" — keys a preset scene/composition
  guestId: string;
  unlockedAt: number;    // epoch ms
  variantId?: string;    // optional, for future alternate compositions of the same moment
}
```

`JournalScene` renders each unlocked `PhotoMemory` by re-composing a **preset scene** (same
Graphics/particle placeholder pieces used live, laid out per a fixed template keyed by
`photoMomentId`) rather than replaying a stored image. If a "real" captured-image feature is wanted
later for a standalone (non-Playables) web build, it would be added as a **separate, local-only
IndexedDB blob store** keyed by `photoMomentId`, never merged into `SaveData`/cloud save.

## 6. Project Structure

```
src/
  core/          Game.ts, EventBus.ts, GameConfig.ts
  scenes/        BootScene, PreloadScene, StationScene, JournalScene, DecorationScene
  entities/      Cloudy.ts, Guest.ts
  guests/        SunGuest.ts, MoonGuest.ts, LittleStarGuest.ts
  systems/       GuestSystem, EmotionSystem, WeatherSystem, IngredientSystem, InteractionSystem,
                 HappinessSystem, ProgressionSystem, DecorationSystem, PhotoMomentSystem,
                 JournalSystem, SaveSystem, AudioSystem
  ui/            DialogueBox, CrystalCounter, InventoryUI, WeatherMixerUI, GuestHintUI, PhotoMomentUI
  data/          guests.json, emotions.json, ingredients.json, recipes.json, decorations.json, journal.json
  services/save/ SaveProvider.ts, LocalSaveProvider.ts
  utils/
  types/
```

Not required to match exactly if a better factoring emerges during implementation, but must
preserve: low coupling, high cohesion, data-driven content, no giant scene files.

## 7. Game Feel, Touch, Responsiveness, Performance

As specified in the product brief: every meaningful interaction gets easing/feedback/particles/sound
(e.g. crystal collection is squash → fly-to-counter → sparkle trail → sound → counter bounce, never
a bare `+1`); Phaser Pointer API (`pointerdown`/`pointermove`/`pointerup`) covers mouse+touch
uniformly, minimum ~44px touch targets; layout uses relative/anchor-based positioning to survive
1920×1080 down to mobile landscape; target 60 FPS desktop / ≥30 FPS mobile, with pooling for
particles/short-lived objects to avoid per-frame allocation and listener leaks.

## 8. Implementation Roadmap (14 passes)

Unchanged from the product brief — implemented strictly in order, each pass built, tested, and
briefly reported before starting the next:

1. Foundation (Phaser+TS+Vite scaffold, EventBus, BootScene/PreloadScene/StationScene)
2. Cloudy (floating/blink/soft-body drag)
3. Guest system (Sun/Moon/Little Star spawn + idle + emotion model)
4. Weather ingredients (floating pickups, inventory, mixer UI shell)
5. Weather crafting (data-driven recipes)
6. Guest soothing (recipe/interaction → emotion transitions with visual feedback)
7. Happiness Crystals (spawn/collect/counter)
8. Decorations (5 items, unlock via crystals, predefined slots, interactive wind chime)
9. Sky Journal (chapters, front/back cards, locked/unlocked memories)
10. Photo Moments (trigger condition, Dewdrop Lens capture UX, journal unlock — metadata only per 5.7)
11. Progression (visit count, trust level, emotional carry-over per Section 17)
12. Save/Load (SaveProvider abstraction, autosave, load, debug reset)
13. Polish (transitions, tweens, particles, audio hooks, feedback)
14. QA (typecheck, build, lint, manual pass over scenes/save/recipes/progression/touch/responsive)

## 9. Definition of Done

Matches Section 33 of the product brief verbatim: a player can start the game, interact with
Cloudy, meet a guest, read their emotional state, collect ingredients, craft the right weather,
soothe the guest to Happy, collect a spawned Happiness Crystal, unlock a decoration, trigger and
capture a Photo Moment, open the Journal, view an unlocked memory, reload the browser, and find all
progression intact — with no TypeScript errors, build errors, or major console errors.
