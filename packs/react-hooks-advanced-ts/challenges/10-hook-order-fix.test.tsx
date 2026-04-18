// @vitest-environment jsdom
import { render, screen, rerender } from '@testing-library/react';
import React, { useEffect, useState } from 'react';

type GreetingProps = {
  visible: boolean;
  name: string;
};

function Greeting({ visible, name }: GreetingProps) {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    setGreeting(`Hello, ${name}`);
  }, [name]);

  if (!visible) {
    return null;
  }

  return <p>{greeting}</p>;
}

describe('10 Hook Call Order', () => {
  it('renders the greeting when visible', () => {
    render(<Greeting visible name="Ada" />);
    expect(screen.getByText(/Hello, Ada/)).toBeDefined();
  });

  it('renders nothing when hidden but re-renders when toggled', () => {
    const { rerender: rr } = render(<Greeting visible={false} name="Ada" />);
    expect(screen.queryByText(/Hello/)).toBeNull();
    rr(<Greeting visible name="Linus" />);
    expect(screen.getByText(/Hello, Linus/)).toBeDefined();
  });
});
