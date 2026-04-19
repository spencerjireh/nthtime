// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useReducer, ChangeEvent, FormEvent } from 'react';

type SignupState = { email: string; password: string; confirm: string };

type SignupAction =
  | { type: 'change'; field: keyof SignupState; value: string }
  | { type: 'reset' };

const initial: SignupState = { email: '', password: '', confirm: '' };

function signupReducer(state: SignupState, action: SignupAction): SignupState {
  switch (action.type) {
    case 'change':
      return { ...state, [action.field]: action.value };
    case 'reset':
      return initial;
  }
}

function SignupForm({ onSubmit }: { onSubmit: (state: SignupState) => void }) {
  const [state, dispatch] = useReducer(signupReducer, initial);

  const change = (field: keyof SignupState) => (e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'change', field, value: e.target.value });
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(state);
  };

  return (
    <form onSubmit={submit}>
      <input placeholder="email" value={state.email} onChange={change('email')} />
      <input placeholder="password" type="password" value={state.password} onChange={change('password')} />
      <input placeholder="confirm" type="password" value={state.confirm} onChange={change('confirm')} />
      <button type="submit">Sign up</button>
    </form>
  );
}

describe('05 Form Reducer', () => {
  it('submits the accumulated state', () => {
    const onSubmit = vi.fn();
    render(<SignupForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByPlaceholderText('email'), { target: { value: 'a@b.io' } });
    fireEvent.change(screen.getByPlaceholderText('password'), { target: { value: 'pw' } });
    fireEvent.change(screen.getByPlaceholderText('confirm'), { target: { value: 'pw' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));

    expect(onSubmit).toHaveBeenCalledWith({ email: 'a@b.io', password: 'pw', confirm: 'pw' });
  });
});
