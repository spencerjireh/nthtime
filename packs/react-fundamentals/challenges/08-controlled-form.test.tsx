// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useState } from 'react';

// Inline reference solution (from 08-controlled-form.json)
function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log({ name, email });
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <button type="submit">Send</button>
    </form>
  );
}

describe('08 Controlled Form', () => {
  it('renders name and email inputs', () => {
    render(<ContactForm />);
    expect(screen.getByPlaceholderText('Name')).toBeDefined();
    expect(screen.getByPlaceholderText('Email')).toBeDefined();
  });

  it('inputs are controlled (value updates on change)', () => {
    render(<ContactForm />);
    const nameInput = screen.getByPlaceholderText('Name') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Alice' } });
    expect(nameInput.value).toBe('Alice');
  });

  it('form submission calls handler', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    render(<ContactForm />);

    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Alice' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'alice@test.com' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    expect(spy).toHaveBeenCalledWith({ name: 'Alice', email: 'alice@test.com' });
    spy.mockRestore();
  });
});
