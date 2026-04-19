// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useReducer, Dispatch } from 'react';

type CounterState = { count: number };
type CounterAction = { type: 'inc' } | { type: 'dec' };

function defaultReducer(state: CounterState, action: CounterAction): CounterState {
  switch (action.type) {
    case 'inc':
      return { count: state.count + 1 };
    case 'dec':
      return { count: state.count - 1 };
  }
}

type OverrideReducer = (
  state: CounterState,
  action: CounterAction,
  defaultNext: CounterState,
) => CounterState;

function useCounter(
  overrideReducer?: OverrideReducer,
): readonly [CounterState, Dispatch<CounterAction>] {
  const reducer = (state: CounterState, action: CounterAction): CounterState => {
    const defaultNext = defaultReducer(state, action);
    return overrideReducer ? overrideReducer(state, action, defaultNext) : defaultNext;
  };
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  return [state, dispatch] as const;
}

function Probe({ override }: { override?: OverrideReducer }) {
  const [state, dispatch] = useCounter(override);
  return (
    <div>
      <p>count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'inc' })}>+</button>
      <button onClick={() => dispatch({ type: 'dec' })}>-</button>
    </div>
  );
}

describe('05 State Reducer Pattern', () => {
  it('uses the default reducer when no override', () => {
    render(<Probe />);
    fireEvent.click(screen.getByRole('button', { name: '+' }));
    fireEvent.click(screen.getByRole('button', { name: '+' }));
    fireEvent.click(screen.getByRole('button', { name: '-' }));
    expect(screen.getByText('count: 1')).toBeDefined();
  });

  it('the override can block transitions (e.g., no negatives)', () => {
    const override: OverrideReducer = (state, action, defaultNext) => {
      if (defaultNext.count < 0) return state;
      return defaultNext;
    };
    render(<Probe override={override} />);
    fireEvent.click(screen.getByRole('button', { name: '-' }));
    fireEvent.click(screen.getByRole('button', { name: '-' }));
    expect(screen.getByText('count: 0')).toBeDefined();
  });
});
