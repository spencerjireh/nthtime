// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useState, useCallback, MouseEventHandler, ReactNode } from 'react';

function useToggleButton() {
  const [pressed, setPressed] = useState(false);

  const getButtonProps = useCallback(
    (userProps?: { onClick?: MouseEventHandler<HTMLButtonElement> }) => ({
      'aria-pressed': pressed,
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        userProps?.onClick?.(e);
        if (!e.defaultPrevented) {
          setPressed((p) => !p);
        }
      },
    }),
    [pressed],
  );

  return { pressed, getButtonProps } as const;
}

function ToggleButton({ children }: { children: ReactNode }) {
  const { pressed, getButtonProps } = useToggleButton();
  return (
    <button {...getButtonProps()}>
      {pressed ? 'on' : 'off'} -- {children}
    </button>
  );
}

describe('08 Prop Getters', () => {
  it('toggles on click via spread props', () => {
    render(<ToggleButton>light</ToggleButton>);
    const btn = screen.getByRole('button') as HTMLButtonElement;
    expect(btn.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(btn);
    expect(screen.getByRole('button').getAttribute('aria-pressed')).toBe('true');
  });

  it('lets a user-supplied onClick block the toggle via preventDefault', () => {
    function Guarded() {
      const { pressed, getButtonProps } = useToggleButton();
      return (
        <button
          {...getButtonProps({
            onClick: (e) => e.preventDefault(),
          })}
        >
          {pressed ? 'on' : 'off'}
        </button>
      );
    }
    render(<Guarded />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button').textContent).toBe('off');
  });
});
