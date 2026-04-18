// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useEffect, useRef, RefObject, useState } from 'react';

function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: (e: MouseEvent) => void,
): void {
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (!ref.current) return;
      if (ref.current.contains(e.target as Node)) return;
      handler(e);
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [ref, handler]);
}

function Menu() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(true);
  useClickOutside(boxRef, () => setOpen(false));
  if (!open) return <p>closed</p>;
  return (
    <div>
      <div ref={boxRef} data-testid="menu">
        inside
      </div>
      <p data-testid="outside">outside</p>
    </div>
  );
}

describe('09 useClickOutside', () => {
  it('ignores clicks inside the ref', () => {
    render(<Menu />);
    fireEvent.mouseDown(screen.getByTestId('menu'));
    expect(screen.queryByText('closed')).toBeNull();
  });

  it('fires when clicking outside', () => {
    render(<Menu />);
    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(screen.getByText('closed')).toBeDefined();
  });
});
