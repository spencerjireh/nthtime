// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import React, { FormEvent } from 'react';

type Contact = { name: string; email: string };

function ContactForm({ onSubmit }: { onSubmit: (contact: Contact) => void }) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    onSubmit({
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" />
      <input name="email" type="email" placeholder="Email" />
      <button type="submit">Send</button>
    </form>
  );
}

describe('03 Form Submit with FormData', () => {
  it('calls onSubmit with parsed values', () => {
    const handleSubmit = vi.fn();
    render(<ContactForm onSubmit={handleSubmit} />);
    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Ada' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'a@b.io' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(handleSubmit).toHaveBeenCalledWith({ name: 'Ada', email: 'a@b.io' });
  });
});
