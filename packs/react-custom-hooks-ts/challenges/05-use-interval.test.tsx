// @vitest-environment jsdom
import { render, screen, act } from '@testing-library/react';
import React, { useEffect, useRef, useState } from 'react';

function useInterval(callback: () => void, delayMs: number | null): void {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delayMs === null) return;
    const id = setInterval(() => savedCallback.current(), delayMs);
    return () => clearInterval(id);
  }, [delayMs]);
}

function Ticker({ delayMs }: { delayMs: number | null }) {
  const [count, setCount] = useState(0);
  useInterval(() => setCount((c) => c + 1), delayMs);
  return <p>count: {count}</p>;
}

describe('05 useInterval', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('fires at the given interval', () => {
    render(<Ticker delayMs={100} />);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByText('count: 3')).toBeDefined();
  });

  it('pauses when delay is null', () => {
    render(<Ticker delayMs={null} />);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByText('count: 0')).toBeDefined();
  });
});
