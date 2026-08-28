import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload(): void {
    this.load.json('guests', 'data/guests.json');
    this.load.json('emotions', 'data/emotions.json');
    this.load.json('ingredients', 'data/ingredients.json');
    this.load.json('recipes', 'data/recipes.json');
  }

  create(): void {
    this.scene.start('StationScene');
  }
}
