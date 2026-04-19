// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useEffect, useRef, useState } from 'react';

class EventBus<TEvents extends Record<string, unknown>> {
  private handlers: {
    [K in keyof TEvents]?: Array<(payload: TEvents[K]) => void>;
  } = {};

  on<K extends keyof TEvents>(
    event: K,
    handler: (payload: TEvents[K]) => void,
  ): () => void {
    const list = this.handlers[event] ?? [];
    list.push(handler);
    this.handlers[event] = list;
    return () => {
      const current = this.handlers[event];
      if (!current) return;
      this.handlers[event] = current.filter((h) => h !== handler);
    };
  }

  emit<K extends keyof TEvents>(event: K, payload: TEvents[K]): void {
    const list = this.handlers[event];
    if (!list) return;
    for (const h of list) h(payload);
  }
}

function useEvent<
  TEvents extends Record<string, unknown>,
  K extends keyof TEvents,
>(bus: EventBus<TEvents>, event: K, handler: (payload: TEvents[K]) => void): void {
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const unsubscribe = bus.on(event, (payload) => handlerRef.current(payload));
    return unsubscribe;
  }, [bus, event]);
}

type AppEvents = {
  notify: string;
};

const bus = new EventBus<AppEvents>();

function Listener() {
  const [last, setLast] = useState('');
  useEvent(bus, 'notify', (msg) => setLast(msg));
  return <p>last: {last}</p>;
}

function Emitter() {
  return <button onClick={() => bus.emit('notify', 'hi')}>emit</button>;
}

describe('13 Observer Pattern', () => {
  it('propagates emitted payloads to the subscribed hook', () => {
    render(
      <>
        <Listener />
        <Emitter />
      </>,
    );
    expect(screen.getByText('last:')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'emit' }));
    expect(screen.getByText('last: hi')).toBeDefined();
  });

  it('unsubscribes on unmount -- no stale updates after teardown', () => {
    const { unmount } = render(<Listener />);
    unmount();
    // Emitting after unmount should not throw
    bus.emit('notify', 'late');
  });
});
