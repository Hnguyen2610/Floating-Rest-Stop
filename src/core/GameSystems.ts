import { EmotionSystem, type EmotionsData } from '../systems/EmotionSystem';
import { GuestSystem, type GuestsData } from '../systems/GuestSystem';
import { IngredientSystem, type IngredientsData } from '../systems/IngredientSystem';
import { WeatherSystem, type RecipesData } from '../systems/WeatherSystem';
import { HappinessSystem } from '../systems/HappinessSystem';
import { DecorationSystem, type DecorationsData } from '../systems/DecorationSystem';
import { JournalSystem, type JournalData } from '../systems/JournalSystem';
import { PhotoMomentSystem, type PhotoMomentsData } from '../systems/PhotoMomentSystem';
import { SaveSystem } from '../systems/SaveSystem';
import { AudioSystem } from '../systems/AudioSystem';
import type { SaveProvider } from '../services/save/SaveProvider';
import { eventBus } from './EventBus';

export interface GameSystems {
  emotionSystem: EmotionSystem;
  guestSystem: GuestSystem;
  ingredientSystem: IngredientSystem;
  weatherSystem: WeatherSystem;
  happinessSystem: HappinessSystem;
  decorationSystem: DecorationSystem;
  journalSystem: JournalSystem;
  photoMomentSystem: PhotoMomentSystem;
  saveSystem: SaveSystem;
  audioSystem: AudioSystem;
}

export interface GameData {
  guests: GuestsData;
  emotions: EmotionsData;
  ingredients: IngredientsData;
  recipes: RecipesData;
  decorations: DecorationsData;
  journal: JournalData;
  photoMoments: PhotoMomentsData;
}

let systems: GameSystems | null = null;

export async function createGameSystems(
  data: GameData,
  saveProvider: SaveProvider,
): Promise<GameSystems> {
  const emotionSystem = new EmotionSystem(data.emotions);
  const guestSystem = new GuestSystem(data.guests, emotionSystem, eventBus);
  const ingredientSystem = new IngredientSystem(data.ingredients, eventBus);
  const weatherSystem = new WeatherSystem(data.recipes, eventBus);
  const happinessSystem = new HappinessSystem(eventBus);
  const decorationSystem = new DecorationSystem(data.decorations, happinessSystem, eventBus);
  const journalSystem = new JournalSystem(data.journal, eventBus);
  const photoMomentSystem = new PhotoMomentSystem(data.photoMoments, journalSystem, eventBus);
  const saveSystem = new SaveSystem(
    saveProvider,
    { happinessSystem, decorationSystem, guestSystem, journalSystem, photoMomentSystem },
    eventBus,
  );
  await saveSystem.whenReady();
  const audioSystem = new AudioSystem();

  systems = {
    emotionSystem,
    guestSystem,
    ingredientSystem,
    weatherSystem,
    happinessSystem,
    decorationSystem,
    journalSystem,
    photoMomentSystem,
    saveSystem,
    audioSystem,
  };
  return systems;
}

export function getGameSystems(): GameSystems {
  if (!systems) throw new Error('Game systems have not been initialized yet');
  return systems;
}
