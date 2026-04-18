// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useReducer } from 'react';

type FormState = {
  name: string;
  email: string;
  submitted: boolean;
};

type FormAction =
  | { type: 'setName'; value: string }
  | { type: 'setEmail'; value: string }
  | { type: 'submit' }
  | { type: 'reset' };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'setName':
      return { ...state, name: action.value };
    case 'setEmail':
      return { ...state, email: action.value };
    case 'submit':
      return { ...state, submitted: true };
    case 'reset':
      return { name: '', email: '', submitted: false };
  }
}

const INITIAL: FormState = { name: '', email: '', submitted: false };

function SignupForm() {
  const [state, dispatch] = useReducer(formReducer, INITIAL);

  if (state.submitted) {
    return <p>Thanks, {state.name}!</p>;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        dispatch({ type: 'submit' });
      }}
    >
      <input
        aria-label="name"
        value={state.name}
        onChange={(e) => dispatch({ type: 'setName', value: e.target.value })}
      />
      <input
        aria-label="email"
        value={state.email}
        onChange={(e) => dispatch({ type: 'setEmail', value: e.target.value })}
      />
      <button type="submit">Sign up</button>
    </form>
  );
}

describe('02 useReducer Form', () => {
  it('captures each field and shows a thank-you on submit', () => {
    render(<SignupForm />);
    fireEvent.change(screen.getByLabelText('name'), { target: { value: 'Ada' } });
    fireEvent.change(screen.getByLabelText('email'), { target: { value: 'a@b.co' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    expect(screen.getByText(/Thanks, Ada!/)).toBeDefined();
  });
});
