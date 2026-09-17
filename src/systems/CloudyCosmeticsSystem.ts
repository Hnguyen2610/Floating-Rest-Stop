import type { TypedEventBus, GameEventMap } from '../core/EventBus';
import type { HappinessSystem } from './HappinessSystem';
import type { GuestSystem } from './GuestSystem';

const GUEST_RELATIONSHIP_TRUST_THRESHOLD = 40;

export interface ShapeDefinition {
  id: string;
  name: string;
  cost?: number;
  unlockedByDefault?: boolean;
}

export interface AccessoryDefinition {
  id: string;
  name: string;
  cost?: number;
}

export interface CloudyCosmeticsData {
  shapes: ShapeDefinition[];
  accessories: AccessoryDefinition[];
}

export interface CloudyCosmeticsSaveState {
  unlockedShapes: string[];
  unlockedAccessories: string[];
  equippedShape: string;
  equippedAccessories: string[];
}

// Unlock sources map directly onto the four listed in the design brief:
// Happiness (crystal cost, via purchaseShape), Memory milestone (any guest's
// resolution memory), Guest relationship (a guest's trust crossing a high
// bar), and Rare guest reward (capturing Aurora/Comet's photo moment).
export class CloudyCosmeticsSystem {
  private unlockedShapes = new Set<string>();
  private unlockedAccessories = new Set<string>();
  private equippedShape = 'default';
  private equippedAccessories = new Set<string>();

  constructor(
    private data: CloudyCosmeticsData,
    private happinessSystem: HappinessSystem,
    private guestSystem: GuestSystem,
    private eventBus: TypedEventBus<GameEventMap>,
  ) {
    data.shapes.filter((shape) => shape.unlockedByDefault).forEach((shape) => this.unlockedShapes.add(shape.id));

    this.eventBus.on('memory:unlocked', ({ memoryId }) => this.checkMemoryMilestone(memoryId));
    this.eventBus.on('guest:left', ({ guestId }) => this.checkGuestRelationship(guestId));
    this.eventBus.on('photo:captured', ({ guestId }) => this.checkRareGuestReward(guestId));
  }

  getShapes(): ShapeDefinition[] {
    return this.data.shapes;
  }

  getAccessories(): AccessoryDefinition[] {
    return this.data.accessories;
  }

  isShapeUnlocked(id: string): boolean {
    return this.unlockedShapes.has(id);
  }

  isAccessoryUnlocked(id: string): boolean {
    return this.unlockedAccessories.has(id);
  }

  purchaseShape(id: string): boolean {
    if (this.unlockedShapes.has(id)) return false;
    const def = this.data.shapes.find((shape) => shape.id === id);
    if (!def || def.cost === undefined) return false;
    if (!this.happinessSystem.spendCrystals(def.cost)) return false;

    this.unlockShape(id);
    return true;
  }

  getEquippedShape(): string {
    return this.equippedShape;
  }

  equipShape(id: string): boolean {
    if (!this.unlockedShapes.has(id)) return false;
    this.equippedShape = id;
    return true;
  }

  getEquippedAccessories(): string[] {
    return [...this.equippedAccessories];
  }

  // Mirrors purchaseShape() — the 3 original accessories only ever unlock via
  // the special conditions below (trust/rare-guest-photo), but a color
  // variant is just cosmetic expression, so it's fair to sell directly for
  // crystals like the heart shape already is.
  purchaseAccessory(id: string): boolean {
    if (this.unlockedAccessories.has(id)) return false;
    const def = this.data.accessories.find((accessory) => accessory.id === id);
    if (!def || def.cost === undefined) return false;
    if (!this.happinessSystem.spendCrystals(def.cost)) return false;

    this.unlockAccessory(id);
    return true;
  }

  toggleAccessory(id: string): boolean {
    if (!this.unlockedAccessories.has(id)) return false;
    if (this.equippedAccessories.has(id)) this.equippedAccessories.delete(id);
    else this.equippedAccessories.add(id);
    return true;
  }

  private checkMemoryMilestone(memoryId: string): void {
    if (memoryId.endsWith('_memory_4')) this.unlockShape('cotton_candy');
  }

  private checkGuestRelationship(guestId: string): void {
    const progress = this.guestSystem.getProgress(guestId);
    if (progress.trustLevel >= GUEST_RELATIONSHIP_TRUST_THRESHOLD) this.unlockAccessory('sunset_hat');
  }

  private checkRareGuestReward(guestId: string): void {
    if (guestId === 'aurora') this.unlockAccessory('rainbow_ribbon');
    if (guestId === 'comet') this.unlockAccessory('star_clip');
  }

  private unlockShape(id: string): void {
    if (this.unlockedShapes.has(id)) return;
    this.unlockedShapes.add(id);
    this.eventBus.emit('cloudyCosmetic:unlocked', { kind: 'shape', id });
  }

  private unlockAccessory(id: string): void {
    if (this.unlockedAccessories.has(id)) return;
    this.unlockedAccessories.add(id);
    this.eventBus.emit('cloudyCosmetic:unlocked', { kind: 'accessory', id });
  }

  getSaveState(): CloudyCosmeticsSaveState {
    return {
      unlockedShapes: [...this.unlockedShapes],
      unlockedAccessories: [...this.unlockedAccessories],
      equippedShape: this.equippedShape,
      equippedAccessories: [...this.equippedAccessories],
    };
  }

  restoreState(state: CloudyCosmeticsSaveState): void {
    const defaultShapes = this.data.shapes.filter((shape) => shape.unlockedByDefault).map((shape) => shape.id);
    this.unlockedShapes = new Set([...defaultShapes, ...state.unlockedShapes]);
    this.unlockedAccessories = new Set(state.unlockedAccessories);
    this.equippedShape = state.equippedShape || 'default';
    this.equippedAccessories = new Set(state.equippedAccessories);
  }
}
