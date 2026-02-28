// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import React from 'react';

// Inline reference solution (from 02-props-display.json)
function Greeting({ name }: { name: string }) {
  return <h1>Hello, {name}!</h1>;
}

describe('02 Props Display', () => {
  it('renders name prop in heading', () => {
    render(<Greeting name="Alice" />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Hello, Alice!');
  });

  it('renders different names', () => {
    render(<Greeting name="Bob" />);
    expect(screen.getByText('Hello, Bob!')).toBeDefined();
  });
});
