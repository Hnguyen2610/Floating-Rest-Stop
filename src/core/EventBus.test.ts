import { describe, expect, it, vi } from 'vitest';
import { TypedEventBus } from './EventBus';

interface TestEventMap {
  'score:changed': number;
  'game:paused': undefined;
}

describe('TypedEventBus', () => {
  it('invokes a registered handler with the emitted payload', () => {
    const bus = new TypedEventBus<TestEventMap>();
    const handler = vi.fn();

    bus.on('score:changed', handler);
    bus.emit('score:changed', 42);

    expect(handler).toHaveBeenCalledWith(42);
  });

  it('stops invoking a handler after off() is called', () => {
    const bus = new TypedEventBus<TestEventMap>();
    const handler = vi.fn();

    bus.on('score:changed', handler);
    bus.off('score:changed', handler);
    bus.emit('score:changed', 7);

    expect(handler).not.toHaveBeenCalled();
  });

  it('only invokes a once() handler a single time', () => {
    const bus = new TypedEventBus<TestEventMap>();
    const handler = vi.fn();

    bus.once('game:paused', handler);
    bus.emit('game:paused', undefined);
    bus.emit('game:paused', undefined);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('scopes removeAllListeners(event) to a single event', () => {
    const bus = new TypedEventBus<TestEventMap>();
    const scoreHandler = vi.fn();
    const pauseHandler = vi.fn();

    bus.on('score:changed', scoreHandler);
    bus.on('game:paused', pauseHandler);
    bus.removeAllListeners('score:changed');
    bus.emit('score:changed', 1);
    bus.emit('game:paused', undefined);

    expect(scoreHandler).not.toHaveBeenCalled();
    expect(pauseHandler).toHaveBeenCalledTimes(1);
  });
});
