import type { GuestState } from '../types/guest';

type Listener<T> = (this: unknown, payload: T) => void;

interface ListenerEntry<T> {
  listener: Listener<T>;
  once: boolean;
  context?: unknown;
}

export class TypedEventBus<TEventMap> {
  private listeners = new Map<keyof TEventMap, Set<ListenerEntry<unknown>>>();

  on<K extends keyof TEventMap>(
    event: K,
    listener: Listener<TEventMap[K]>,
    context?: unknown,
  ): void {
    this.addListener(event, listener, false, context);
  }

  once<K extends keyof TEventMap>(
    event: K,
    listener: Listener<TEventMap[K]>,
    context?: unknown,
  ): void {
    this.addListener(event, listener, true, context);
  }

  off<K extends keyof TEventMap>(event: K, listener: Listener<TEventMap[K]>): void {
    const entries = this.listeners.get(event);
    if (!entries) return;
    for (const entry of entries) {
      if (entry.listener === listener) {
        entries.delete(entry);
      }
    }
  }

  emit<K extends keyof TEventMap>(event: K, payload: TEventMap[K]): void {
    const entries = this.listeners.get(event);
    if (!entries) return;
    for (const entry of Array.from(entries)) {
      entry.listener.call(entry.context, payload);
      if (entry.once) {
        entries.delete(entry);
      }
    }
  }

  removeAllListeners(event?: keyof TEventMap): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  private addListener<K extends keyof TEventMap>(
    event: K,
    listener: Listener<TEventMap[K]>,
    once: boolean,
    context?: unknown,
  ): void {
    let entries = this.listeners.get(event);
    if (!entries) {
      entries = new Set();
      this.listeners.set(event, entries);
    }
    entries.add({ listener: listener as Listener<unknown>, once, context });
  }
}

export interface GameEventMap {
  'boot:complete': undefined;
  'guest:arrived': GuestState;
  'guest:left': { guestId: string };
  'guest:emotion-changed': GuestState;
  'guest:relaxed': { guestId: string };
  'happiness:collected': { count: number };
  'happiness:spent': { count: number };
  'decoration:unlocked': { id: string };
  'decoration:placed': { id: string };
  'memory:unlocked': { memoryId: string };
  'photo:captured': { photoMomentId: string; guestId: string };
  'ingredient:collected': { id: string; count: number };
  'ingredient:spent': { id: string; count: number };
  'mixer:updated': { contents: string[] };
  'weather:created': { recipeId: string };
  'weather:used': { recipeId: string };
  'journal:layout-updated': { itemId: string; x: number; y: number; rotation: number; scale: number };
  'journal:item-removed': { itemId: string };
  'paperboat:sent': { messageId: string; trustGuestId: string | null };
  'area:unlocked': { id: string };
  'daynight:changed': { isNight: boolean };
  'cloudyCosmetic:unlocked': { kind: 'shape' | 'accessory'; id: string };
  'rareGuest:available': { guestId: string };
  'save:started': undefined;
  'save:completed': undefined;
  'save:failed': undefined;
}

export const eventBus = new TypedEventBus<GameEventMap>();
