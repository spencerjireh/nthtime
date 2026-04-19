// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { FormEvent, useState } from 'react';

function LoginForm({ onSubmit }: { onSubmit: (email: string) => void }) {
  const [email, setEmail] = useState('');
  const handle = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(email);
  };
  return (
    <form onSubmit={handle}>
      <label htmlFor="email">email</label>
      <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button type="submit">submit</button>
    </form>
  );
}

describe('03 form submit test', () => {
  it('forwards typed value to onSubmit', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<LoginForm onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText('email'), 'a@b.co');
    await user.click(screen.getByRole('button', { name: 'submit' }));
    expect(onSubmit).toHaveBeenCalledWith('a@b.co');
  });
});
