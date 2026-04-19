// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useReducer,
} from 'react';
import React from 'react';

type State = { count: number };
type Action = { type: 'inc' } | { type: 'dec' };

const reducer = (s: State, a: Action): State => {
  switch (a.type) {
    case 'inc':
      return { count: s.count + 1 };
    case 'dec':
      return { count: s.count - 1 };
  }
};

const StateCtx = createContext<State | null>(null);
const DispatchCtx = createContext<Dispatch<Action> | null>(null);

function CounterProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  return (
    <StateCtx.Provider value={state}>
      <DispatchCtx.Provider value={dispatch}>{children}</DispatchCtx.Provider>
    </StateCtx.Provider>
  );
}

function useCounterState(): State {
  const ctx = useContext(StateCtx);
  if (!ctx) throw new Error('useCounterState outside provider');
  return ctx;
}
function useCounterDispatch(): Dispatch<Action> {
  const ctx = useContext(DispatchCtx);
  if (!ctx) throw new Error('useCounterDispatch outside provider');
  return ctx;
}

function Display() {
  const { count } = useCounterState();
  return <p>count: {count}</p>;
}

function Buttons() {
  const dispatch = useCounterDispatch();
  return <button onClick={() => dispatch({ type: 'inc' })}>+</button>;
}

describe('02 split state/dispatch contexts', () => {
  it('increments via dispatch context', async () => {
    const user = userEvent.setup();
    render(
      <CounterProvider>
        <Display />
        <Buttons />
      </CounterProvider>,
    );
    expect(screen.getByText('count: 0')).toBeDefined();
    await user.click(screen.getByRole('button', { name: '+' }));
    expect(screen.getByText('count: 1')).toBeDefined();
  });
});
