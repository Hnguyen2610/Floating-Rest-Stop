import Phaser from 'phaser';

// This game is landscape-only. Rather than build a second portrait layout,
// a touch device held in portrait gets a "please rotate" overlay instead —
// a plain HTML/CSS element (sibling to #app), not a Phaser GameObject, so it
// works no matter which scene is active and doesn't depend on the canvas
// having initialized. `pointer: coarse` targets actual touchscreens — a
// desktop browser window resized narrow/tall must NOT trigger this.
const PORTRAIT_QUERY = '(orientation: portrait)';
const TOUCH_QUERY = '(pointer: coarse)';

export function installOrientationGuard(game: Phaser.Game): void {
  const overlay = document.createElement('div');
  overlay.id = 'orientation-guard';
  overlay.setAttribute('role', 'alert');
  overlay.innerHTML = `
    <div class="orientation-guard-icon">📱↻</div>
    <div class="orientation-guard-text">Xoay ngang điện thoại để chơi nhé</div>
  `;
  overlay.style.cssText = [
    'position:fixed',
    'inset:0',
    'z-index:10000',
    'display:none',
    'flex-direction:column',
    'align-items:center',
    'justify-content:center',
    'gap:16px',
    'background:#a9d8f0',
    'color:#5b4a63',
    'font-family:Arial,sans-serif',
    'text-align:center',
    'padding:24px',
  ].join(';');
  const icon = overlay.querySelector<HTMLElement>('.orientation-guard-icon');
  if (icon) icon.style.cssText = 'font-size:48px;animation:orientation-guard-spin 1.6s ease-in-out infinite;';
  const text = overlay.querySelector<HTMLElement>('.orientation-guard-text');
  if (text) text.style.cssText = 'font-size:16px;max-width:280px;';

  const style = document.createElement('style');
  style.textContent = `
    @keyframes orientation-guard-spin {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(90deg); }
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(overlay);

  const portraitQuery = window.matchMedia(PORTRAIT_QUERY);
  const touchQuery = window.matchMedia(TOUCH_QUERY);

  const sync = (): void => {
    const shouldShow = portraitQuery.matches && touchQuery.matches;
    overlay.style.display = shouldShow ? 'flex' : 'none';
    if (shouldShow) {
      game.loop.sleep();
    } else {
      game.loop.wake();
    }
  };

  portraitQuery.addEventListener('change', sync);
  touchQuery.addEventListener('change', sync);
  sync();
}
