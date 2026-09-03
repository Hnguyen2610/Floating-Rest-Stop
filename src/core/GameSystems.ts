import { EmotionSystem, type EmotionsData } from '../systems/EmotionSystem';
import { GuestSystem, type GuestsData } from '../systems/GuestSystem';
import { IngredientSystem, type IngredientsData } from '../systems/IngredientSystem';
import { WeatherSystem, type RecipesData } from '../systems/WeatherSystem';
import { HappinessSystem } from '../systems/HappinessSystem';
import { StationAreaSystem, type AreasData } from '../systems/StationAreaSystem';
import { DecorationSystem, type DecorationsData } from '../systems/DecorationSystem';
import { JournalSystem, type JournalData } from '../systems/JournalSystem';
import { PhotoMomentSystem, type PhotoMomentsData } from '../systems/PhotoMomentSystem';
import { PaperBoatSystem, type PaperMessagesData } from '../systems/PaperBoatSystem';
import { DayNightSystem } from '../systems/DayNightSystem';
import { CloudyCosmeticsSystem, type CloudyCosmeticsData } from '../systems/CloudyCosmeticsSystem';
import { RareGuestSystem } from '../systems/RareGuestSystem';
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
  stationAreaSystem: StationAreaSystem;
  decorationSystem: DecorationSystem;
  journalSystem: JournalSystem;
  photoMomentSystem: PhotoMomentSystem;
  paperBoatSystem: PaperBoatSystem;
  dayNightSystem: DayNightSystem;
  cloudyCosmeticsSystem: CloudyCosmeticsSystem;
  rareGuestSystem: RareGuestSystem;
  saveSystem: SaveSystem;
  audioSystem: AudioSystem;
}

export interface GameData {
  guests: GuestsData;
  emotions: EmotionsData;
  ingredients: IngredientsData;
  recipes: RecipesData;
  areas: AreasData;
  decorations: DecorationsData;
  journal: JournalData;
  photoMoments: PhotoMomentsData;
  messages: PaperMessagesData;
  cloudyCosmetics: CloudyCosmeticsData;
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
  const stationAreaSystem = new StationAreaSystem(data.areas, happinessSystem, eventBus);
  const decorationSystem = new DecorationSystem(data.decorations, happinessSystem, stationAreaSystem, eventBus);
  const journalSystem = new JournalSystem(data.journal, eventBus, guestSystem);
  const photoMomentSystem = new PhotoMomentSystem(data.photoMoments, journalSystem, eventBus);
  const paperBoatSystem = new PaperBoatSystem(data.messages, happinessSystem, guestSystem, eventBus);
  const dayNightSystem = new DayNightSystem(eventBus);
  const cloudyCosmeticsSystem = new CloudyCosmeticsSystem(data.cloudyCosmetics, happinessSystem, guestSystem, eventBus);
  const rareGuestSystem = new RareGuestSystem(
    guestSystem,
    decorationSystem,
    stationAreaSystem,
    journalSystem,
    dayNightSystem,
  );
  const saveSystem = new SaveSystem(
    saveProvider,
    {
      happinessSystem,
      stationAreaSystem,
      decorationSystem,
      guestSystem,
      journalSystem,
      photoMomentSystem,
      paperBoatSystem,
      dayNightSystem,
      cloudyCosmeticsSystem,
    },
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
    stationAreaSystem,
    decorationSystem,
    journalSystem,
    photoMomentSystem,
    paperBoatSystem,
    dayNightSystem,
    cloudyCosmeticsSystem,
    rareGuestSystem,
    saveSystem,
    audioSystem,
  };
  return systems;
}

export function getGameSystems(): GameSystems {
  if (!systems) throw new Error('Game systems have not been initialized yet');
  return systems;
}
