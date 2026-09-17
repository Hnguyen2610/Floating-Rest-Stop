import Phaser from 'phaser';
import { PALETTE, FONT_FAMILY, GAME_WIDTH, GAME_HEIGHT } from '../core/GameConfig';
import type { WeatherSystem } from '../systems/WeatherSystem';
import type { IngredientSystem } from '../systems/IngredientSystem';
import type { GuestSystem } from '../systems/GuestSystem';

const PANEL_WIDTH = 380;
const ROW_HEIGHT = 62;
const HEADER_HEIGHT = 56;
const BOTTOM_MARGIN = 24;

// Guest-agnostic label for each non-recipe treatment id — 'direct' guests
// (currently only Little Star's 'gentle_polish') have no recipe to list, so
// without this the Recipe Book silently omits them, leaving players unable
// to find out what to do for the very guest they opened the book for.
const DIRECT_TREATMENT_LABELS: Record<string, string> = {
  gentle_polish: '🤍 Vuốt nhẹ nhàng',
};

export class RecipeBookUI {
  private readonly panel: Phaser.GameObjects.Container;

  constructor(
    scene: Phaser.Scene,
    weatherSystem: WeatherSystem,
    ingredientSystem: IngredientSystem,
    guestSystem: GuestSystem,
  ) {
    const recipes = weatherSystem.getAllRecipes();
    const directGuests = guestSystem.getAllDefinitions().filter((def) => def.treatment.type === 'direct');
    const totalRows = recipes.length + directGuests.length;
    const panelHeight = HEADER_HEIGHT + totalRows * ROW_HEIGHT + BOTTOM_MARGIN;

    this.panel = scene.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    this.panel.setDepth(900);

    const backdrop = scene.add
      .rectangle(0, 0, PANEL_WIDTH, panelHeight, PALETTE.cloudWhite, 0.97)
      .setStrokeStyle(2, PALETTE.eyeColor, 0.3);
    this.panel.add(backdrop);

    const title = scene.add
      .text(0, -panelHeight / 2 + 26, '📖 Sổ Công Thức', {
        fontFamily: FONT_FAMILY,
        fontSize: '16px',
        color: '#5b4a63',
      })
      .setOrigin(0.5);
    this.panel.add(title);

    const closeButton = scene.add
      .text(PANEL_WIDTH / 2 - 20, -panelHeight / 2 + 20, '✕', {
        fontFamily: FONT_FAMILY,
        fontSize: '18px',
        color: '#5b4a63',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    closeButton.on('pointerdown', () => this.hide());
    this.panel.add(closeButton);

    const listTop = -panelHeight / 2 + HEADER_HEIGHT;
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

    directGuests.forEach((guest, index) => {
      const rowY = listTop + (recipes.length + index) * ROW_HEIGHT + ROW_HEIGHT / 2;
      const row = scene.add.container(0, rowY);

      const bg = scene.add
        .rectangle(0, 0, PANEL_WIDTH - 32, ROW_HEIGHT - 10, PALETTE.lavender, 0.25)
        .setStrokeStyle(1, PALETTE.eyeColor, 0.15);
      row.add(bg);

      const treatmentLabel =
        guest.treatment.type === 'direct'
          ? (DIRECT_TREATMENT_LABELS[guest.treatment.interactionId] ?? guest.treatment.interactionId)
          : '';
      const nameLabel = scene.add
        .text(-PANEL_WIDTH / 2 + 24, -14, treatmentLabel, {
          fontFamily: FONT_FAMILY,
          fontSize: '14px',
          color: '#5b4a63',
        })
        .setOrigin(0, 0.5);
      row.add(nameLabel);

      const guestLabel = scene.add
        .text(-PANEL_WIDTH / 2 + 24, 14, `Dành cho: ${guest.name}`, {
          fontFamily: FONT_FAMILY,
          fontSize: '10px',
          color: '#8a7a94',
        })
        .setOrigin(0, 0.5);
      row.add(guestLabel);

      // No ingredients for a direct interaction — reuse the guest's own
      // needHint action clause (after the em dash) instead of ingredient dots.
      const actionText = guest.needHint.includes(' — ')
        ? guest.needHint.split(' — ')[1]
        : guest.needHint;
      const actionLabel = scene.add
        .text(PANEL_WIDTH / 2 - 24, 0, actionText, {
          fontFamily: FONT_FAMILY,
          fontSize: '10px',
          color: '#5b4a63',
          align: 'right',
          wordWrap: { width: 150 },
        })
        .setOrigin(1, 0.5);
      row.add(actionLabel);

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
