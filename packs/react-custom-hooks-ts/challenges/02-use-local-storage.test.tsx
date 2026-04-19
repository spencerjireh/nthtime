// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useEffect, useState } from 'react';

function useLocalStorage<T>(
  key: string,
  initial: T,
): readonly [T, (next: T) => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initial;
    const raw = window.localStorage.getItem(key);
    if (raw === null) return initial;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore quota errors
    }
  }, [key, value]);

  return [value, setValue] as const;
}

function Probe() {
  const [count, setCount] = useLocalStorage('nthtime-test-counter', 0);
  return (
    <div>
      <p>count: {count}</p>
      <button onClick={() => setCount(count + 1)}>inc</button>
    </div>
  );
}

describe('02 useLocalStorage', () => {
  let storage: Record<string, string> = {};
  const mock: Storage = {
    get length() {
      return Object.keys(storage).length;
    },
    clear: () => {
      storage = {};
    },
    getItem: (key) => (key in storage ? storage[key] : null),
    key: (i) => Object.keys(storage)[i] ?? null,
    removeItem: (key) => {
      delete storage[key];
    },
    setItem: (key, value) => {
      storage[key] = value;
    },
  };

  beforeEach(() => {
    storage = {};
    Object.defineProperty(window, 'localStorage', { value: mock, configurable: true });
  });

  it('reads initial when storage is empty', () => {
    render(<Probe />);
    expect(screen.getByText('count: 0')).toBeDefined();
  });

  it('persists across renders', () => {
    const { unmount } = render(<Probe />);
    fireEvent.click(screen.getByRole('button', { name: 'inc' }));
    fireEvent.click(screen.getByRole('button', { name: 'inc' }));
    expect(storage['nthtime-test-counter']).toBe('2');
    unmount();
    render(<Probe />);
    expect(screen.getByText('count: 2')).toBeDefined();
  });

  it('recovers from corrupt data', () => {
    storage['nthtime-test-counter'] = 'not-json';
    render(<Probe />);
    expect(screen.getByText('count: 0')).toBeDefined();
  });
});
