// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

type ButtonProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

function Button({ label, onClick, disabled }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}

describe('01 Typed Props: Button', () => {
  it('renders the label', () => {
    render(<Button label="Save" onClick={() => {}} />);
    expect(screen.getByRole('button', { name: /save/i })).toBeDefined();
  });

  it('fires onClick when clicked', () => {
    let clicked = 0;
    render(<Button label="Tap" onClick={() => (clicked += 1)} />);
    fireEvent.click(screen.getByRole('button', { name: /tap/i }));
    expect(clicked).toBe(1);
  });

  it('respects the disabled prop', () => {
    render(<Button label="Nope" onClick={() => {}} disabled />);
    const btn = screen.getByRole('button', { name: /nope/i }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });
});
