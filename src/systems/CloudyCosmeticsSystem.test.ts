import { describe, expect, it } from 'vitest';
import { CloudyCosmeticsSystem, type CloudyCosmeticsData } from './CloudyCosmeticsSystem';
import { HappinessSystem } from './HappinessSystem';
import { GuestSystem, type GuestsData } from './GuestSystem';
import { EmotionSystem, type EmotionsData } from './EmotionSystem';
import { TypedEventBus, type GameEventMap } from '../core/EventBus';

const cosmeticsData: CloudyCosmeticsData = {
  shapes: [
    { id: 'default', name: 'Default', unlockedByDefault: true },
    { id: 'heart', name: 'Heart', cost: 8 },
    { id: 'cotton_candy', name: 'Cotton Candy' },
  ],
  accessories: [
    { id: 'sunset_hat', name: 'Sunset Hat' },
    { id: 'star_clip', name: 'Star Clip' },
    { id: 'rainbow_ribbon', name: 'Rainbow Ribbon' },
    { id: 'sunset_hat_pink', name: 'Sunset Hat (Pink)', cost: 5 },
  ],
};

const guestsData: GuestsData = {
  guests: [
    {
      id: 'moon',
      name: 'Moon',
      initialEmotion: 'MOON_LONELY',
      initialIntensity: 85,
      treatment: { type: 'recipe', recipeId: 'starry_lullaby' },
      needHint: 'needs a lullaby',
    },
  ],
};

const emotionsData: EmotionsData = {
  stageThresholds: { distressed: 70, calming: 50, relaxed: 30, content: 10, peaceful: 0 },
  emotions: { MOON_LONELY: { label: 'Lonely', color: '#6b7fb0' } },
};

function makeSystem() {
  const bus = new TypedEventBus<GameEventMap>();
  const happinessSystem = new HappinessSystem(bus);
  const guestSystem = new GuestSystem(guestsData, new EmotionSystem(emotionsData), bus);
  const system = new CloudyCosmeticsSystem(cosmeticsData, happinessSystem, guestSystem, bus);
  return { bus, happinessSystem, guestSystem, system };
}

describe('CloudyCosmeticsSystem', () => {
  it('starts with only the default shape unlocked and equipped', () => {
    const { system } = makeSystem();
    expect(system.isShapeUnlocked('default')).toBe(true);
    expect(system.isShapeUnlocked('heart')).toBe(false);
    expect(system.getEquippedShape()).toBe('default');
  });

  it('purchases a shape with crystals (Happiness unlock path)', () => {
    const { happinessSystem, system } = makeSystem();
    for (let i = 0; i < 8; i += 1) happinessSystem.collectCrystal();

    expect(system.purchaseShape('heart')).toBe(true);
    expect(system.isShapeUnlocked('heart')).toBe(true);
    expect(happinessSystem.getCount()).toBe(0);
  });

  it('cannot equip a shape that has not been unlocked', () => {
    const { system } = makeSystem();
    expect(system.equipShape('heart')).toBe(false);
    expect(system.getEquippedShape()).toBe('default');
  });

  it('unlocks cotton_candy when any guest resolution memory unlocks (Memory milestone)', () => {
    const { bus, system } = makeSystem();
    expect(system.isShapeUnlocked('cotton_candy')).toBe(false);

    bus.emit('memory:unlocked', { memoryId: 'sun_memory_4' });

    expect(system.isShapeUnlocked('cotton_candy')).toBe(true);
  });

  it('unlocks sunset_hat when a guest trust crosses the threshold (Guest relationship)', () => {
    const { guestSystem, system } = makeSystem();
    guestSystem.addTrust('moon', 40);
    expect(system.isAccessoryUnlocked('sunset_hat')).toBe(false);

    guestSystem.spawn('moon');
    guestSystem.leave();

    expect(system.isAccessoryUnlocked('sunset_hat')).toBe(true);
  });

  it('unlocks rainbow_ribbon / star_clip from rare guest photo captures (Rare guest reward)', () => {
    const { bus, system } = makeSystem();
    bus.emit('photo:captured', { photoMomentId: 'aurora_veil_01', guestId: 'aurora' });
    bus.emit('photo:captured', { photoMomentId: 'comet_trail_01', guestId: 'comet' });

    expect(system.isAccessoryUnlocked('rainbow_ribbon')).toBe(true);
    expect(system.isAccessoryUnlocked('star_clip')).toBe(true);
  });

  it('toggles accessories on and off once unlocked', () => {
    const { bus, system } = makeSystem();
    bus.emit('photo:captured', { photoMomentId: 'aurora_veil_01', guestId: 'aurora' });

    expect(system.toggleAccessory('rainbow_ribbon')).toBe(true);
    expect(system.getEquippedAccessories()).toEqual(['rainbow_ribbon']);
    expect(system.toggleAccessory('rainbow_ribbon')).toBe(true);
    expect(system.getEquippedAccessories()).toEqual([]);
  });

  it('purchases a color-variant accessory with crystals directly (no prerequisite)', () => {
    const { happinessSystem, system } = makeSystem();
    for (let i = 0; i < 5; i += 1) happinessSystem.collectCrystal();

    expect(system.isAccessoryUnlocked('sunset_hat')).toBe(false); // base never unlocked
    expect(system.purchaseAccessory('sunset_hat_pink')).toBe(true);
    expect(system.isAccessoryUnlocked('sunset_hat_pink')).toBe(true);
    expect(happinessSystem.getCount()).toBe(0);
  });

  it('refuses to purchase an accessory with no cost (must unlock via its real condition)', () => {
    const { happinessSystem, system } = makeSystem();
    for (let i = 0; i < 99; i += 1) happinessSystem.collectCrystal();

    expect(system.purchaseAccessory('sunset_hat')).toBe(false);
    expect(system.isAccessoryUnlocked('sunset_hat')).toBe(false);
    expect(happinessSystem.getCount()).toBe(99); // nothing spent
  });

  it('refuses to purchase an accessory twice, and without enough crystals', () => {
    const { happinessSystem, system } = makeSystem();
    expect(system.purchaseAccessory('sunset_hat_pink')).toBe(false); // 0 crystals

    for (let i = 0; i < 5; i += 1) happinessSystem.collectCrystal();
    expect(system.purchaseAccessory('sunset_hat_pink')).toBe(true);
    expect(system.purchaseAccessory('sunset_hat_pink')).toBe(false); // already owned
  });

  it('restores saved state, keeping default-unlocked shapes', () => {
    const { system } = makeSystem();
    system.restoreState({
      unlockedShapes: ['heart'],
      unlockedAccessories: ['sunset_hat'],
      equippedShape: 'heart',
      equippedAccessories: ['sunset_hat'],
    });

    expect(system.isShapeUnlocked('default')).toBe(true);
    expect(system.isShapeUnlocked('heart')).toBe(true);
    expect(system.getEquippedShape()).toBe('heart');
    expect(system.getEquippedAccessories()).toEqual(['sunset_hat']);
  });
});
