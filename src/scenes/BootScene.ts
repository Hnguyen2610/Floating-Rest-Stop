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
