// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useState, ChangeEvent } from 'react';

function Greeting() {
  const [name, setName] = useState<string>('');

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  return (
    <div>
      <input value={name} onChange={onChange} />
      <p>{name ? `Hello, ${name}!` : 'Hello, stranger!'}</p>
    </div>
  );
}

describe('01 Controlled Input', () => {
  it('starts with the stranger greeting', () => {
    render(<Greeting />);
    expect(screen.getByText('Hello, stranger!')).toBeDefined();
  });

  it('updates the greeting as the user types', () => {
    render(<Greeting />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Ada' } });
    expect(input.value).toBe('Ada');
    expect(screen.getByText('Hello, Ada!')).toBeDefined();
  });
});
