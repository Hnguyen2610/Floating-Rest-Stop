import type { TypedEventBus, GameEventMap } from '../core/EventBus';

const MIXER_CAPACITY = 2;

export class WeatherSystem {
  private mixerContents: string[] = [];

  constructor(private eventBus: TypedEventBus<GameEventMap>) {}

  addToMixer(ingredientId: string): boolean {
    if (this.mixerContents.length >= MIXER_CAPACITY) return false;
    this.mixerContents.push(ingredientId);
    this.eventBus.emit('mixer:updated', { contents: [...this.mixerContents] });
    return true;
  }

  getMixerContents(): string[] {
    return [...this.mixerContents];
  }

  clearMixer(): void {
    this.mixerContents = [];
    this.eventBus.emit('mixer:updated', { contents: [] });
  }
}
