// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { create } from 'zustand';
import React from 'react';

type CounterState = {
  count: number;
  inc: () => void;
  dec: () => void;
};

const useCounterStore = create<CounterState>()((set) => ({
  count: 0,
  inc: () => set((s) => ({ count: s.count + 1 })),
  dec: () => set((s) => ({ count: s.count - 1 })),
}));

function Counter() {
  const count = useCounterStore((s) => s.count);
  const inc = useCounterStore((s) => s.inc);
  const dec = useCounterStore((s) => s.dec);
  return (
    <>
      <p>count: {count}</p>
      <button onClick={inc}>+</button>
      <button onClick={dec}>-</button>
    </>
  );
}

beforeEach(() => useCounterStore.setState({ count: 0 }));

describe('03 Zustand basic store', () => {
  it('increments and decrements', async () => {
    const user = userEvent.setup();
    render(<Counter />);
    expect(screen.getByText('count: 0')).toBeDefined();
    await user.click(screen.getByRole('button', { name: '+' }));
    await user.click(screen.getByRole('button', { name: '+' }));
    expect(screen.getByText('count: 2')).toBeDefined();
    await user.click(screen.getByRole('button', { name: '-' }));
    expect(screen.getByText('count: 1')).toBeDefined();
  });
});
