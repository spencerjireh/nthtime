// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost';
};

function Button({ variant = 'primary', ...rest }: ButtonProps) {
  return <button data-variant={variant} {...rest} />;
}

describe('10 shared UI kit Button', () => {
  it('forwards children, click handler, and variant', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button variant="ghost" onClick={onClick}>
        click
      </Button>,
    );
    const btn = screen.getByRole('button', { name: 'click' });
    expect(btn.getAttribute('data-variant')).toBe('ghost');
    await user.click(btn);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('defaults variant to primary', () => {
    render(<Button>x</Button>);
    expect(screen.getByRole('button', { name: 'x' }).getAttribute('data-variant')).toBe('primary');
  });
});
