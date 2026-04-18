// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useCallback, useState } from 'react';

type UseControllableStateOptions<T> = {
  value?: T;
  defaultValue: T;
  onChange?: (next: T) => void;
};

function useControllableState<T>(
  opts: UseControllableStateOptions<T>,
): readonly [T, (next: T) => void] {
  const [internal, setInternal] = useState<T>(opts.defaultValue);
  const isControlled = opts.value !== undefined;
  const value = isControlled ? (opts.value as T) : internal;

  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) {
        setInternal(next);
      }
      opts.onChange?.(next);
    },
    [isControlled, opts],
  );

  return [value, setValue] as const;
}

function Toggle({ value, onChange }: { value?: boolean; onChange?: (next: boolean) => void }) {
  const [on, setOn] = useControllableState({ value, defaultValue: false, onChange });
  return (
    <button onClick={() => setOn(!on)}>{on ? 'on' : 'off'}</button>
  );
}

describe('10 useControllableState', () => {
  it('works uncontrolled', () => {
    render(<Toggle />);
    expect(screen.getByRole('button', { name: 'off' })).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'off' }));
    expect(screen.getByRole('button', { name: 'on' })).toBeDefined();
  });

  it('works controlled', () => {
    function Host() {
      const [v, setV] = useState(false);
      return <Toggle value={v} onChange={setV} />;
    }
    render(<Host />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button', { name: 'on' })).toBeDefined();
  });

  it('fires onChange in both modes', () => {
    let changes = 0;
    render(<Toggle onChange={() => (changes += 1)} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('button'));
    expect(changes).toBe(2);
  });
});
