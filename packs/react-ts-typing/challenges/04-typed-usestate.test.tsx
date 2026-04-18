// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useState } from 'react';

type User = {
  id: string;
  email: string;
};

function LoginForm() {
  const [email, setEmail] = useState('');
  const [user, setUser] = useState<User | null>(null);

  return (
    <div>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <button onClick={() => setUser({ id: '1', email })}>Sign in</button>
      {user ? <p>Signed in as {user.email}</p> : null}
    </div>
  );
}

describe('04 Typed useState', () => {
  it('starts with no user', () => {
    render(<LoginForm />);
    expect(screen.queryByText(/signed in/i)).toBeNull();
  });

  it('signs in with the typed email', () => {
    render(<LoginForm />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'alex@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(screen.getByText(/Signed in as alex@example\.com/)).toBeDefined();
  });
});
