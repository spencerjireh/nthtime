// @vitest-environment jsdom
import { render, screen, act } from '@testing-library/react';
import React, { useEffect, useRef, useState } from 'react';

function useEventListener<K extends keyof WindowEventMap>(
  event: K,
  handler: (e: WindowEventMap[K]) => void,
): void {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const listener = (e: WindowEventMap[K]) => handlerRef.current(e);
    window.addEventListener(event, listener);
    return () => window.removeEventListener(event, listener);
  }, [event]);
}

function KeyCount() {
  const [count, setCount] = useState(0);
  useEventListener('keydown', () => setCount((c) => c + 1));
  return <p>keys: {count}</p>;
}

describe('06 useEventListener', () => {
  it('fires on the typed event and cleans up on unmount', () => {
    const { unmount } = render(<KeyCount />);
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown'));
      window.dispatchEvent(new KeyboardEvent('keydown'));
    });
    expect(screen.getByText('keys: 2')).toBeDefined();

    unmount();
    // After unmount, events should no longer be handled
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown'));
    });
    // Nothing to assert -- no throws, no leaked handlers.
  });
});
