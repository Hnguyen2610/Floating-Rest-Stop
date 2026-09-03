import Phaser from 'phaser';
import { PALETTE, FONT_FAMILY, GAME_WIDTH, GAME_HEIGHT } from '../core/GameConfig';
import type { WeatherSystem } from '../systems/WeatherSystem';
import type { IngredientSystem } from '../systems/IngredientSystem';
import type { GuestSystem } from '../systems/GuestSystem';

const PANEL_WIDTH = 380;
const PANEL_HEIGHT = 400;
const ROW_HEIGHT = 62;

export class RecipeBookUI {
  private readonly panel: Phaser.GameObjects.Container;

  constructor(
    scene: Phaser.Scene,
    weatherSystem: WeatherSystem,
    ingredientSystem: IngredientSystem,
    guestSystem: GuestSystem,
  ) {
    this.panel = scene.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    this.panel.setDepth(900);

    const backdrop = scene.add
      .rectangle(0, 0, PANEL_WIDTH, PANEL_HEIGHT, PALETTE.cloudWhite, 0.97)
      .setStrokeStyle(2, PALETTE.eyeColor, 0.3);
    this.panel.add(backdrop);

    const title = scene.add
      .text(0, -PANEL_HEIGHT / 2 + 26, '📖 Sổ Công Thức', {
        fontFamily: FONT_FAMILY,
        fontSize: '16px',
        color: '#5b4a63',
      })
      .setOrigin(0.5);
    this.panel.add(title);

    const closeButton = scene.add
      .text(PANEL_WIDTH / 2 - 20, -PANEL_HEIGHT / 2 + 20, '✕', {
        fontFamily: FONT_FAMILY,
        fontSize: '18px',
        color: '#5b4a63',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    closeButton.on('pointerdown', () => this.hide());
    this.panel.add(closeButton);

    const recipes = weatherSystem.getAllRecipes();
    const listTop = -PANEL_HEIGHT / 2 + 56;
    recipes.forEach((recipe, index) => {
      const rowY = listTop + index * ROW_HEIGHT + ROW_HEIGHT / 2;
      const row = scene.add.container(0, rowY);

      const bg = scene.add
        .rectangle(0, 0, PANEL_WIDTH - 32, ROW_HEIGHT - 10, PALETTE.lavender, 0.25)
        .setStrokeStyle(1, PALETTE.eyeColor, 0.15);
      row.add(bg);

      const nameLabel = scene.add
        .text(-PANEL_WIDTH / 2 + 24, -14, recipe.name, {
          fontFamily: FONT_FAMILY,
          fontSize: '14px',
          color: '#5b4a63',
        })
        .setOrigin(0, 0.5);
      row.add(nameLabel);

      const guestNames = recipe.suitableGuests
        .map((guestId) => guestSystem.getAllDefinitions().find((def) => def.id === guestId)?.name ?? guestId)
        .join(', ');
      const guestLabel = scene.add
        .text(-PANEL_WIDTH / 2 + 24, 14, `Dành cho: ${guestNames}`, {
          fontFamily: FONT_FAMILY,
          fontSize: '10px',
          color: '#8a7a94',
        })
        .setOrigin(0, 0.5);
      row.add(guestLabel);

      const ingredientText = recipe.ingredients
        .map((id) => ingredientSystem.getDefinition(id).name)
        .join('  +  ');
      const ingredientsX = PANEL_WIDTH / 2 - 24;

      recipe.ingredients.forEach((ingredientId, ingredientIndex) => {
        const dot = scene.add.circle(
          0,
          0,
          6,
          Phaser.Display.Color.HexStringToColor(ingredientSystem.getDefinition(ingredientId).color).color,
        );
        dot.setPosition(ingredientsX - (recipe.ingredients.length - 1 - ingredientIndex) * 14, 0);
        row.add(dot);
      });

      const ingredientsLabel = scene.add
        .text(ingredientsX, 16, ingredientText, {
          fontFamily: FONT_FAMILY,
          fontSize: '10px',
          color: '#5b4a63',
          align: 'right',
        })
        .setOrigin(1, 0.5);
      row.add(ingredientsLabel);

      this.panel.add(row);
    });

    this.panel.setVisible(false);
  }

  toggle(): void {
    this.panel.setVisible(!this.panel.visible);
  }

  hide(): void {
    this.panel.setVisible(false);
  }
}
