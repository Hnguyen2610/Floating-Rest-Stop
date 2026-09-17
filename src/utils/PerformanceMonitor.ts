/**
 * Lightweight FPS tracker for local debugging — averages over a rolling
 * ~1s window. Never shown by default; StationScene only creates the on-
 * screen readout behind a debug key (see keydown-P), matching the existing
 * debug-key pattern for everything else that isn't meant for real players.
 */
export class PerformanceMonitor {
  private frameCount = 0;
  private elapsedMs = 0;
  private currentFps = 0;

  /** Call once per frame with the engine's delta (ms). */
  update(deltaMs: number): void {
    this.frameCount += 1;
    this.elapsedMs += deltaMs;
    if (this.elapsedMs >= 1000) {
      this.currentFps = Math.round((this.frameCount * 1000) / this.elapsedMs);
      this.frameCount = 0;
      this.elapsedMs = 0;
    }
  }

  getFps(): number {
    return this.currentFps;
  }
}
