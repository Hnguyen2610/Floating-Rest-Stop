# Fullscreen / Landscape-Mobile Responsive Layout — Design

## Goal

Make the game fill the entire viewport edge-to-edge on both web (desktop browser windows of any aspect ratio) and mobile phones held in landscape orientation — no letterbox bars on any side. Accept cropping at the edges on devices whose aspect ratio differs from the game's native 16:9, as long as no interactive control becomes unreachable within a realistic device range. Show a "rotate your phone" prompt when a touch device is in portrait orientation, since the game is landscape-only.

## Context

The game runs at a fixed internal resolution of 1280×720 (`GAME_WIDTH`/`GAME_HEIGHT` in `src/core/GameConfig.ts`). `src/core/Game.ts` currently configures Phaser with `scale.mode: Phaser.Scale.FIT` and `autoCenter: Phaser.Scale.CENTER_BOTH` — this scales the canvas down to fit inside the browser viewport while preserving the 16:9 aspect ratio, leaving visible letterbox bars (background color) on any viewport whose ratio isn't exactly 16:9. Every UI element across `StationScene.ts`, `JournalScene.ts`, and the reusable `src/ui/*.ts` components is positioned with fixed pixel coordinates relative to `GAME_WIDTH`/`GAME_HEIGHT` (e.g. `GAME_WIDTH - 32`, `GAME_HEIGHT - 50`), and a large fraction of the interactive controls (bottom nav, top-right utility icons, mixer/recipe-book buttons, Journal's back/decorate buttons, sticker tray) sit within 40–90px of a canvas edge.

## Non-Goals

- No portrait layout. Portrait shows a rotate prompt instead of reflowing content.
- No dynamic/responsive re-layout (Phaser `Scale.RESIZE`). The internal 1280×720 resolution and all existing absolute-pixel UI positioning stay as-is; only the positions of edge-anchored elements move inward.
- No real OS/browser Fullscreen API integration (no "⛶ fullscreen" button). This is about the game filling its existing viewport/iframe, not requesting browser chrome to hide.
- No orientation-lock API usage (unreliable outside installed-PWA/fullscreen contexts across browsers) — the rotate prompt is the whole mechanism for handling portrait.

## Approach

### 1. Scale mode: `Phaser.Scale.FIT` → `Phaser.Scale.ENVELOP`

One-line change in `src/core/Game.ts`. `ENVELOP` scales the canvas up so it fully covers the viewport in both dimensions, cropping whichever axis overflows, instead of shrinking to fit inside with bars. Internal resolution and every existing coordinate stay valid — this is purely a scale-mode swap, not a resolution change.

Given native ratio 1280/720 ≈ 1.778:
- Viewport **wider** than 1.778 (common landscape phones, ultra-wide monitors) → canvas scales to match viewport width → top and bottom get cropped.
- Viewport **narrower** than 1.778 (tablets in landscape, narrow desktop windows) → canvas scales to match viewport height → left and right get cropped.

Both directions are realistic and the safe-zone design below accounts for both.

### 2. Safe zone for edge-anchored UI

**Policy:** every interactive control's hit area must stay fully on-screen for viewport ratios in **[1.5, 2.2]** (covers the large majority of real phones in landscape, laptops, and typical desktop windows — verified against iPhone SE/14 landscape, common 16:9/16:10 laptops). Outside that range (older 4:3-ish tablets in landscape, unusually ultra-wide monitors), decorative padding around a control may get cropped but the control's own tap target must not.

**Concrete margin:** inset every edge-anchored element so no interactive control's hit area sits closer than **80px** to any of the 4 canvas edges (top/bottom/left/right), replacing whatever ad hoc margin (16–90px, inconsistent) each currently uses. 80px was chosen by computing the worst-case per-side crop at the boundary ratios of the target range (≈64px at ratio 1.6 narrowing, ≈64px at ratio 2.16 widening) and rounding up for a comfortable buffer rather than sitting exactly on the edge of the safe range.

**Elements that need to move (enumerated so the implementation plan has a concrete checklist — exact new coordinates are a plan-time detail, not fixed here):**

`src/scenes/StationScene.ts`:
- Title text ("Trạm Dừng Chân Lơ Lửng") — currently `(16, 12)`
- `CrystalCounter` — currently `(GAME_WIDTH - 32, 32)`
- Mute button + settings gear — currently `(GAME_WIDTH - 32, 70)` / `(GAME_WIDTH - 64, 70)`
- Day/night toggle + help (❓) button — currently `(GAME_WIDTH - 32, 104)` / `(GAME_WIDTH - 64, 104)`
- Recipe book button (📖) — currently `(GAME_WIDTH - 90, GAME_HEIGHT - 178)`
- `WeatherMixerUI` (bowl + craft button) — currently anchored `(GAME_WIDTH - 90, GAME_HEIGHT - 112)`
- `InventoryUI` — currently `(24, 76)`
- Both `BottomNavUI` clusters — currently `(64, GAME_HEIGHT - 50)` and `(900, GAME_HEIGHT - 50)`. The shared `y` is the real problem for both (card half-height 38 + label below it puts the bottom edge within ~12px of `GAME_HEIGHT`, far inside the 80px margin) — `y` must move up for both. The left cluster's `x=64` also needs to move right (card left edge sits ~26px from the canvas edge). The right cluster's `x=900` is a hardcoded absolute offset, not `GAME_WIDTH`-relative; with `CARD_STRIDE=92` and 3 items its rightmost card edge already lands ~158px from `GAME_WIDTH`, comfortably inside the margin today — confirm this still holds after any other change rather than assuming it, since it's the one edge-cluster coordinate not obviously in need of adjustment.

`src/scenes/JournalScene.ts`:
- Title ("Sky Journal") — currently `(GAME_WIDTH / 2, 48)` (Y only, already centered on X)
- Back button ("← Quay lại") — currently `(90, 40)`
- "🎀 Trang trí" button — currently `(GAME_WIDTH - 60, 40)`
- Sticker palette tray — currently `(GAME_WIDTH / 2, GAME_HEIGHT - 30)` (Y only)

Non-interactive decorative elements (sky gradient, platform graphic, floating ingredients spawn zone, guest/Cloudy positions which are already comfortably inset) do not need to move — they naturally extend to fill the cropped area since they're drawn to cover the full `GAME_WIDTH`×`GAME_HEIGHT` canvas already.

### 3. Portrait rotate-prompt overlay

New standalone module, **not** built into `Platform.ts`/`PlatformAdapter` — orientation is a distinct concern from the pause/resume platform lifecycle those already model, and YouTube Playables' pause hook has no natural equivalent for "please rotate," so keeping it separate avoids overloading that abstraction.

`src/ui/OrientationGuard.ts` (or similar):
- Plain HTML/CSS overlay — a `<div>` sibling to `#app` in `index.html`, not a Phaser GameObject/scene — so it works regardless of which Phaser scene is active and doesn't depend on the canvas having initialized cleanly.
- Detection: `window.matchMedia('(pointer: coarse)')` (true for touch-primary devices — correctly excludes a desktop browser window that's merely been resized narrow/tall) **and** `window.matchMedia('(orientation: portrait)')`.
- Both match → show the overlay (icon + short Vietnamese prompt to rotate), call `game.loop.sleep()`.
- Either stops matching → hide the overlay, call `game.loop.wake()`.
- Listen via `matchMedia(...).addEventListener('change', ...)` (covers both device rotation and, incidentally, desktop window resizing across the threshold, which is fine/correct either way).

### 4. CSS/HTML additions

`index.html`:
- Add `viewport-fit=cover` to the existing `<meta name="viewport">` tag — required for iOS Safari to extend content under the notch/home-indicator safe areas instead of reserving letterbox-like space for them even when the page is otherwise edge-to-edge.
- Add `padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)` to `#app` (or an outer wrapper) — standard defensive practice for edge-to-edge web content on notched devices, cheap to add regardless of how large the safe-zone margins above turn out to be in practice.

### 5. Testing plan

Real Playwright verification (screenshots + interaction, not just reading code) across a matrix of realistic viewports, both portrait and landscape where relevant:

| Device | Viewport | Ratio | Expected |
|---|---|---|---|
| iPhone SE landscape | 667×375 | 1.78 | ~no crop (matches native ratio) |
| iPhone 14 landscape | 844×390 | 2.16 | top/bottom crop, all controls reachable |
| Common laptop | 1366×768 | 1.78 | ~no crop |
| iPad landscape | 1024×768 | 1.33 | left/right crop — outside target range, verify controls still tappable even if padding is cropped |
| Ultra-wide monitor | 2560×1080 | 2.37 | top/bottom crop — outside target range, same check |
| iPhone SE portrait | 375×667 | 0.56 | rotate-prompt overlay shown, game paused |

For each landscape case: screenshot, confirm every relocated control is visible and its hit area is fully on-screen (not just "mostly"), then actually click/tap each one to confirm it still responds. For the portrait case: confirm the overlay appears, confirm it disappears on a simulated rotation (viewport swap), confirm `game.loop` pause/wake fires (no gameplay progressing while hidden).

## Open Questions / Risks

- The exact new coordinates for each relocated element are determined during implementation, verified visually — this spec fixes the *margin policy* (80px from any edge) and *target ratio range* ([1.5, 2.2]), not literal pixel values, since those depend on each element's own width/anchor (e.g. `CrystalCounter`'s label extends right of its origin and needs its own trailing-edge accounted for, not just its container origin).
