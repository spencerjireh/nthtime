// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useReducer } from 'react';

type CounterAction = { type: 'inc' } | { type: 'dec' } | { type: 'reset' };

function counterReducer(state: number, action: CounterAction): number {
  switch (action.type) {
    case 'inc':
      return state + 1;
    case 'dec':
      return state - 1;
    case 'reset':
      return 0;
  }
}

function Counter() {
  const [count, dispatch] = useReducer(counterReducer, 0);
  return (
    <div>
      <p>count: {count}</p>
      <button onClick={() => dispatch({ type: 'inc' })}>+</button>
      <button onClick={() => dispatch({ type: 'dec' })}>-</button>
      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
    </div>
  );
}

describe('01 useReducer Counter', () => {
  it('starts at 0', () => {
    render(<Counter />);
    expect(screen.getByText('count: 0')).toBeDefined();
  });

  it('increments and decrements', () => {
    render(<Counter />);
    fireEvent.click(screen.getByRole('button', { name: '+' }));
    fireEvent.click(screen.getByRole('button', { name: '+' }));
    fireEvent.click(screen.getByRole('button', { name: '-' }));
    expect(screen.getByText('count: 1')).toBeDefined();
  });

  it('resets', () => {
    render(<Counter />);
    fireEvent.click(screen.getByRole('button', { name: '+' }));
    fireEvent.click(screen.getByRole('button', { name: '+' }));
    fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    expect(screen.getByText('count: 0')).toBeDefined();
  });
});
