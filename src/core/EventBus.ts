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
}

export const eventBus = new TypedEventBus<GameEventMap>();
