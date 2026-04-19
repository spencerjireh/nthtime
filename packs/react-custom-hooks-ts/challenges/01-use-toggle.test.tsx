// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useCallback, useState } from 'react';

function useToggle(
  initial = false,
): readonly [boolean, () => void, (next: boolean) => void] {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue((v) => !v), []);
  const set = useCallback((next: boolean) => setValue(next), []);
  return [value, toggle, set] as const;
}

function Probe() {
  const [value, toggle, set] = useToggle();
  return (
    <div>
      <p>value: {String(value)}</p>
      <button onClick={toggle}>toggle</button>
      <button onClick={() => set(true)}>force-true</button>
    </div>
  );
}

describe('01 useToggle', () => {
  it('toggles and forces', () => {
    render(<Probe />);
    expect(screen.getByText('value: false')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'toggle' }));
    expect(screen.getByText('value: true')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'toggle' }));
    expect(screen.getByText('value: false')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'force-true' }));
    expect(screen.getByText('value: true')).toBeDefined();
  });
});
