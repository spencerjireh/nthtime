// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import React, { useEffect, useRef } from 'react';

function AutoFocusInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} placeholder="auto-focused" />;
}

describe('05 Typed useRef', () => {
  it('focuses the input on mount', () => {
    render(<AutoFocusInput />);
    const input = screen.getByPlaceholderText(/auto-focused/i);
    expect(document.activeElement).toBe(input);
  });
});
