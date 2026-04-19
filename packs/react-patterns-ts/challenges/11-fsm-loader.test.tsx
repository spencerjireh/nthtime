// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useReducer, Dispatch } from 'react';

type LoaderState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: string }
  | { status: 'error'; error: string };

type LoaderAction =
  | { type: 'fetch' }
  | { type: 'resolved'; data: string }
  | { type: 'rejected'; error: string }
  | { type: 'reset' };

function loaderReducer(state: LoaderState, action: LoaderAction): LoaderState {
  switch (action.type) {
    case 'fetch':
      if (state.status === 'loading') return state;
      return { status: 'loading' };
    case 'resolved':
      if (state.status !== 'loading') return state;
      return { status: 'success', data: action.data };
    case 'rejected':
      if (state.status !== 'loading') return state;
      return { status: 'error', error: action.error };
    case 'reset':
      return { status: 'idle' };
  }
}

function useLoader(): readonly [LoaderState, Dispatch<LoaderAction>] {
  const [state, dispatch] = useReducer(loaderReducer, { status: 'idle' } as LoaderState);
  return [state, dispatch] as const;
}

function Probe() {
  const [state, dispatch] = useLoader();
  let content = '';
  if (state.status === 'idle') content = 'idle';
  else if (state.status === 'loading') content = 'loading';
  else if (state.status === 'success') content = `ok: ${state.data}`;
  else content = `err: ${state.error}`;
  return (
    <div>
      <p>{content}</p>
      <button onClick={() => dispatch({ type: 'fetch' })}>fetch</button>
      <button onClick={() => dispatch({ type: 'resolved', data: 'payload' })}>resolve</button>
      <button onClick={() => dispatch({ type: 'rejected', error: 'boom' })}>reject</button>
      <button onClick={() => dispatch({ type: 'reset' })}>reset</button>
    </div>
  );
}

describe('11 FSM Loader', () => {
  it('cycles through valid transitions', () => {
    render(<Probe />);
    expect(screen.getByText('idle')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'fetch' }));
    expect(screen.getByText('loading')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'resolve' }));
    expect(screen.getByText('ok: payload')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'reset' }));
    expect(screen.getByText('idle')).toBeDefined();
  });

  it('ignores resolved outside loading', () => {
    render(<Probe />);
    fireEvent.click(screen.getByRole('button', { name: 'resolve' }));
    expect(screen.getByText('idle')).toBeDefined();
  });
});
