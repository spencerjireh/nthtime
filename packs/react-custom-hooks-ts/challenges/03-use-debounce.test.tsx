// @vitest-environment jsdom
import { render, screen, act } from '@testing-library/react';
import React, { useEffect, useState } from 'react';

function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}

function Probe({ text }: { text: string }) {
  const debounced = useDebounce(text, 200);
  return <p>{debounced}</p>;
}

describe('03 useDebounce', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('updates only after the delay', () => {
    const { rerender } = render(<Probe text="a" />);
    rerender(<Probe text="ab" />);
    rerender(<Probe text="abc" />);
    expect(screen.getByText('a')).toBeDefined();
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByText('abc')).toBeDefined();
  });
});
