// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import React from 'react';

function Greeting({ name }: { name: string }) {
  return <p>Hello, {name}!</p>;
}

describe('01 render + getByText', () => {
  it('renders the greeting text', () => {
    render(<Greeting name="Ada" />);
    expect(screen.getByText('Hello, Ada!')).toBeDefined();
  });
});
