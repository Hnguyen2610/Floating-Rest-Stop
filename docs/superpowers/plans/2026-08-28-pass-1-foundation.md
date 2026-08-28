# Floating Rest Stop — Pass 1: Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the Phaser 3 + TypeScript + Vite project skeleton — tooling, EventBus, and a
Boot → Preload → Station scene chain — so that `npm install`, `npm run dev`, and `npm run build`
all work and the Station scene visibly renders.

**Architecture:** Thin Phaser Scenes (composition/lifecycle only) sit on top of an engine-agnostic
`core/` layer (`EventBus`, `GameConfig`, `Game` bootstrap). No gameplay systems yet — this pass only
proves the pipeline and lays the two pieces every later pass depends on: the typed EventBus and the
Boot/Preload/Station scene chain.

**Tech Stack:** Phaser 3.90.0 (exact pin), TypeScript 6.0.x (strict), Vite 8.x, Vitest 4.x, ESLint
10.x (flat config, typescript-eslint), Prettier 3.x, npm.

## Global Constraints

These apply to this pass and every later one; each task below implicitly includes them.

- Phaser is pinned to exact `3.90.0` in `package.json` (no `^`/`~`) — do not let it float to Phaser 4.
- TypeScript `strict: true`, no `any` without explicit justification.
- npm is the only package manager (`npm install` / `npm run dev` / `npm run build` must all work).
- Scenes contain composition, lifecycle, and input-routing only — no gameplay/business logic. That
  logic lives in `systems/`, introduced starting in Pass 3.
- UI is Phaser-native (Container/Graphics/Text/BitmapText) — no DOM overlay, except a future
  dev-only debug panel stripped from production builds.
- EventBus is for domain events / broadcast notifications (something happened, react if you care).
  Use direct method calls when one system needs to query or command another — never invent
  request/response event pairs.
- No external or copyrighted art/audio assets — all visuals are Phaser Graphics/particle
  placeholders (pastel, soft, rounded), matching the palette defined in this pass's `GameConfig`.
- Touch-first: rely on Phaser's unified Pointer API (`pointerdown`/`pointermove`/`pointerup`), never
  branch on mouse vs. touch separately.
- Leave zero TypeScript errors, build errors, ESLint errors, or browser console errors/warnings at
  the end of any task.

---

### Task 1: Project scaffold & tooling

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `.gitignore`
- Create: `eslint.config.js`
- Create: `.prettierrc.json`
- Create: `src/main.ts`

**Interfaces:**
- Produces: a working `npm install` / `npm run dev` / `npm run build` / `npm run typecheck` /
  `npm run lint` / `npm run test` pipeline that every later task and pass builds on. No exported
  TS symbols yet — `src/main.ts` is a temporary smoke-test entry point that Task 3 replaces
  entirely.

- [x] **Step 1: Create `package.json`**

```json
{
  "name": "floating-rest-stop",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "format": "prettier --write .",
    "test": "vitest run"
  },
  "dependencies": {
    "phaser": "3.90.0"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "eslint": "^10.9.1",
    "prettier": "^3.9.6",
    "typescript": "^6.0.3",
    "typescript-eslint": "^8.68.0",
    "vite": "^8.2.2",
    "vitest": "^4.1.11"
  }
}
```

`typescript` is capped below 7.x on purpose: `typescript-eslint@8.68.0`'s peer range is
`>=4.8.4 <6.1.0` and does not yet support TypeScript 7 (verified via `npm view typescript-eslint
peerDependencies` and `npm view typescript dist-tags` on 2026-08-28) — installing bare `typescript`
`latest` would silently break linting.

- [x] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

- [x] **Step 3: Create `vite.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
```

- [x] **Step 4: Create `index.html`**

```html
<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    />
    <title>Floating Rest Stop</title>
    <style>
      html,
      body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background: #a9d8f0;
        overflow: hidden;
      }
      #app {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      canvas {
        touch-action: none;
      }
    </style>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [x] **Step 5: Create `.gitignore`**

```
node_modules
dist
*.local
```

- [x] **Step 6: Create `eslint.config.js`**

```js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
);
```

Type-aware lint rules (`parserOptions.project`) are intentionally skipped for now — root-level
config files (`vite.config.ts`, `eslint.config.js`) sit outside `tsconfig.json`'s `include: ["src"]`
and would otherwise fail ESLint's "file not in project" check. Revisit only if a later pass needs
type-aware rules badly enough to justify a second tsconfig for tooling files.

- [x] **Step 7: Create `.prettierrc.json`**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100
}
```

- [x] **Step 8: Create `src/main.ts` (temporary smoke-test entry)**

```ts
const app = document.querySelector<HTMLDivElement>('#app');

if (app) {
  app.textContent = 'Floating Rest Stop — booting...';
}
```

- [x] **Step 9: Install dependencies**

Run: `npm install`
Expected: exits 0, creates `node_modules/` and `package-lock.json`, no `ERESOLVE` errors.

- [x] **Step 10: Verify typecheck, lint, and build**

Run: `npm run typecheck`
Expected: exits 0, no output (no errors).

Run: `npm run lint`
Expected: exits 0, no errors reported.

Run: `npm run build`
Expected: exits 0, prints a Vite build summary, creates `dist/index.html` and `dist/assets/*.js`.

- [x] **Step 11: Commit**

```bash
git add package.json package-lock.json tsconfig.json vite.config.ts index.html .gitignore eslint.config.js .prettierrc.json src/main.ts
git commit -m "chore: scaffold Vite + TypeScript + Phaser project tooling"
```

---

### Task 2: Typed EventBus

**Files:**
- Create: `src/core/EventBus.ts`
- Test: `src/core/EventBus.test.ts`

**Interfaces:**
- Consumes: nothing (pure TypeScript, no Phaser dependency — keeps the core testable in plain
  Node/Vitest and keeps `core/` engine-agnostic).
- Produces:
  - `class TypedEventBus<TEventMap>` with methods
    `on<K extends keyof TEventMap>(event: K, listener: (payload: TEventMap[K]) => void, context?: unknown): void`,
    `once<K extends keyof TEventMap>(event: K, listener: (payload: TEventMap[K]) => void, context?: unknown): void`,
    `off<K extends keyof TEventMap>(event: K, listener: (payload: TEventMap[K]) => void): void`,
    `emit<K extends keyof TEventMap>(event: K, payload: TEventMap[K]): void`,
    `removeAllListeners(event?: keyof TEventMap): void`.
  - `interface GameEventMap` — the game-wide event catalog, currently just
    `{ 'boot:complete': undefined }`. Later passes add keys here (e.g. `'guest:arrived'`,
    `'happiness:collected'`) — never introduce a second event map.
  - `const eventBus: TypedEventBus<GameEventMap>` — the singleton every scene/system imports.

- [x] **Step 1: Write the failing test**

Create `src/core/EventBus.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import { TypedEventBus } from './EventBus';

interface TestEventMap {
  'score:changed': number;
  'game:paused': undefined;
}

describe('TypedEventBus', () => {
  it('invokes a registered handler with the emitted payload', () => {
    const bus = new TypedEventBus<TestEventMap>();
    const handler = vi.fn();

    bus.on('score:changed', handler);
    bus.emit('score:changed', 42);

    expect(handler).toHaveBeenCalledWith(42);
  });

  it('stops invoking a handler after off() is called', () => {
    const bus = new TypedEventBus<TestEventMap>();
    const handler = vi.fn();

    bus.on('score:changed', handler);
    bus.off('score:changed', handler);
    bus.emit('score:changed', 7);

    expect(handler).not.toHaveBeenCalled();
  });

  it('only invokes a once() handler a single time', () => {
    const bus = new TypedEventBus<TestEventMap>();
    const handler = vi.fn();

    bus.once('game:paused', handler);
    bus.emit('game:paused', undefined);
    bus.emit('game:paused', undefined);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('scopes removeAllListeners(event) to a single event', () => {
    const bus = new TypedEventBus<TestEventMap>();
    const scoreHandler = vi.fn();
    const pauseHandler = vi.fn();

    bus.on('score:changed', scoreHandler);
    bus.on('game:paused', pauseHandler);
    bus.removeAllListeners('score:changed');
    bus.emit('score:changed', 1);
    bus.emit('game:paused', undefined);

    expect(scoreHandler).not.toHaveBeenCalled();
    expect(pauseHandler).toHaveBeenCalledTimes(1);
  });
});
```

- [x] **Step 2: Run the test to verify it fails**

Run: `npm run test`
Expected: FAIL — Vitest reports it cannot resolve `./EventBus` (module does not exist yet).

- [x] **Step 3: Implement `src/core/EventBus.ts`**

```ts
type Listener<T> = (this: unknown, payload: T) => void;

interface ListenerEntry<T> {
  listener: Listener<T>;
  once: boolean;
  context?: unknown;
}

export class TypedEventBus<TEventMap> {
  private listeners = new Map<keyof TEventMap, Set<ListenerEntry<unknown>>>();

  on<K extends keyof TEventMap>(
    event: K,
    listener: Listener<TEventMap[K]>,
    context?: unknown,
  ): void {
    this.addListener(event, listener, false, context);
  }

  once<K extends keyof TEventMap>(
    event: K,
    listener: Listener<TEventMap[K]>,
    context?: unknown,
  ): void {
    this.addListener(event, listener, true, context);
  }

  off<K extends keyof TEventMap>(event: K, listener: Listener<TEventMap[K]>): void {
    const entries = this.listeners.get(event);
    if (!entries) return;
    for (const entry of entries) {
      if (entry.listener === listener) {
        entries.delete(entry);
      }
    }
  }

  emit<K extends keyof TEventMap>(event: K, payload: TEventMap[K]): void {
    const entries = this.listeners.get(event);
    if (!entries) return;
    for (const entry of Array.from(entries)) {
      entry.listener.call(entry.context, payload);
      if (entry.once) {
        entries.delete(entry);
      }
    }
  }

  removeAllListeners(event?: keyof TEventMap): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  private addListener<K extends keyof TEventMap>(
    event: K,
    listener: Listener<TEventMap[K]>,
    once: boolean,
    context?: unknown,
  ): void {
    let entries = this.listeners.get(event);
    if (!entries) {
      entries = new Set();
      this.listeners.set(event, entries);
    }
    entries.add({ listener: listener as Listener<unknown>, once, context });
  }
}

export interface GameEventMap {
  'boot:complete': undefined;
}

export const eventBus = new TypedEventBus<GameEventMap>();
```

- [x] **Step 4: Run the test to verify it passes**

Run: `npm run test`
Expected: PASS — 4 tests passed in `src/core/EventBus.test.ts`.

- [x] **Step 5: Verify typecheck and lint**

Run: `npm run typecheck`
Expected: exits 0.

Run: `npm run lint`
Expected: exits 0.

- [x] **Step 6: Commit**

```bash
git add src/core/EventBus.ts src/core/EventBus.test.ts
git commit -m "feat: add typed EventBus core"
```

---

### Task 3: Boot → Preload → Station scene chain

**Files:**
- Create: `src/core/GameConfig.ts`
- Create: `src/scenes/BootScene.ts`
- Create: `src/scenes/PreloadScene.ts`
- Create: `src/scenes/StationScene.ts`
- Create: `src/core/Game.ts`
- Modify: `src/main.ts` (replace the Task 1 placeholder entirely)

**Interfaces:**
- Consumes: `eventBus`, `GameEventMap` from `src/core/EventBus.ts` (Task 2).
- Produces:
  - `GAME_WIDTH: number`, `GAME_HEIGHT: number` (1280×720, 16:9 base resolution) and
    `PALETTE: { skyTop, skyBottom, cloudWhite, pastelPink, lavender, mint, softYellow }` (all
    `number` hex colors) from `src/core/GameConfig.ts` — every later pass's placeholder art reads
    colors from this one object, never inlines hex literals.
  - `class BootScene extends Phaser.Scene` (key `'BootScene'`), `class PreloadScene extends
    Phaser.Scene` (key `'PreloadScene'`), `class StationScene extends Phaser.Scene` (key
    `'StationScene'`).
  - `function createGame(parent: string): Phaser.Game` from `src/core/Game.ts`.

- [x] **Step 1: Create `src/core/GameConfig.ts`**

```ts
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const PALETTE = {
  skyTop: 0xa9d8f0,
  skyBottom: 0xfff6e5,
  cloudWhite: 0xfdfbf7,
  pastelPink: 0xf7c9d0,
  lavender: 0xd9c9ec,
  mint: 0xc8ede0,
  softYellow: 0xfdf2a4,
} as const;
```

- [x] **Step 2: Create `src/scenes/BootScene.ts`**

```ts
import Phaser from 'phaser';
import { eventBus } from '../core/EventBus';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
    eventBus.emit('boot:complete', undefined);
    this.scene.start('PreloadScene');
  }
}
```

- [x] **Step 3: Create `src/scenes/PreloadScene.ts`**

```ts
import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  create(): void {
    this.scene.start('StationScene');
  }
}
```

This scene has no work to do yet — Pass 4 (weather ingredients) is what first gives it a real
manifest of JSON/atlas assets to load with a progress bar.

- [x] **Step 4: Create `src/scenes/StationScene.ts`**

```ts
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PALETTE } from '../core/GameConfig';

export class StationScene extends Phaser.Scene {
  constructor() {
    super('StationScene');
  }

  create(): void {
    this.drawSky();
    this.drawPlatform();
    this.drawTitle();
  }

  private drawSky(): void {
    const sky = this.add.graphics();
    sky.fillGradientStyle(PALETTE.skyTop, PALETTE.skyTop, PALETTE.skyBottom, PALETTE.skyBottom, 1);
    sky.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }

  private drawPlatform(): void {
    const platform = this.add.graphics();
    const centerX = GAME_WIDTH / 2;
    const centerY = GAME_HEIGHT * 0.72;

    platform.fillStyle(PALETTE.cloudWhite, 1);
    platform.fillEllipse(centerX, centerY, 420, 140);
    platform.fillStyle(PALETTE.mint, 0.5);
    platform.fillEllipse(centerX - 90, centerY - 20, 160, 70);
    platform.fillStyle(PALETTE.pastelPink, 0.5);
    platform.fillEllipse(centerX + 110, centerY - 10, 140, 60);
  }

  private drawTitle(): void {
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.18, 'Trạm Dừng Chân Lơ Lửng', {
        fontFamily: 'Georgia, serif',
        fontSize: '40px',
        color: '#5b4a63',
      })
      .setOrigin(0.5);
  }
}
```

- [x] **Step 5: Create `src/core/Game.ts`**

```ts
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './GameConfig';
import { BootScene } from '../scenes/BootScene';
import { PreloadScene } from '../scenes/PreloadScene';
import { StationScene } from '../scenes/StationScene';

export function createGame(parent: string): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#a9d8f0',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [BootScene, PreloadScene, StationScene],
  };

  return new Phaser.Game(config);
}
```

- [x] **Step 6: Replace `src/main.ts`**

```ts
import { createGame } from './core/Game';

createGame('app');
```

- [x] **Step 7: Verify typecheck**

Run: `npm run typecheck`
Expected: exits 0.

- [x] **Step 8: Manually verify the Station scene renders**

Run: `npm run dev`, open the printed local URL (e.g. `http://localhost:5173`) in a browser.

Expected, visually:
- A vertical pastel gradient background (sky blue at top fading to cream at the bottom).
- The centered title text "Trạm Dừng Chân Lơ Lửng" near the top.
- A soft cloud-colored platform shape (white ellipse with a mint and a pink patch) in the lower
  third of the canvas.
- No errors or warnings in the browser devtools console.

- [x] **Step 9: Verify production build**

Run: `npm run build`
Expected: exits 0, `dist/` contains `index.html` and hashed JS assets.

Run: `npm run preview`, open the printed URL, confirm the same visual result as Step 8.

- [x] **Step 10: Commit**

```bash
git add src/core/GameConfig.ts src/core/Game.ts src/scenes/BootScene.ts src/scenes/PreloadScene.ts src/scenes/StationScene.ts src/main.ts
git commit -m "feat: wire Boot/Preload/Station scene chain and Phaser bootstrap"
```

---

### Task 4: Pass 1 acceptance verification

**Files:** none (verification only; fix forward in the relevant file from Tasks 1–3 if something
fails).

**Interfaces:** none — this task only exercises what Tasks 1–3 produced.

- [x] **Step 1: Run the full check suite**

Run in order, all from a clean `node_modules` if in doubt (`rm -rf node_modules && npm install`):

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Expected: every command exits 0. If any fails, fix the underlying file from Task 1–3 (not this
task) and re-run the full suite before continuing.

- [x] **Step 2: Manually verify responsiveness**

Run: `npm run dev`. With the browser devtools responsive-design mode, check the canvas at:
- 1920×1080 (desktop)
- 1366×768 (small desktop/laptop)
- a mobile-landscape size, e.g. 844×390

Expected at every size: the canvas letterboxes (scales via `Phaser.Scale.FIT`) without stretching,
cropping content unexpectedly, or leaving the page scrollable. No console errors on resize.

- [x] **Step 3: Commit any fixes**

If Steps 1–2 required changes, stage exactly the files touched and commit:

```bash
git add -A
git commit -m "fix: address Pass 1 acceptance check failures"
```

If nothing needed fixing, skip this step — there is nothing to commit.

- [x] **Step 4: Write the Pass 1 completion report**

Post a short report in this format (per the project's working-style convention) summarizing what
was implemented, files added/modified, and the four command results from Step 1:

```
## PASS 1 COMPLETE

### Implemented
- ...

### Files Added
- ...

### Tests
- npm run build: PASS/FAIL
- npm run test: PASS/FAIL

### Remaining Issues
- ...

### Next Pass
- Pass 2: Cloudy (soft-body drag character)
```
