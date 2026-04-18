// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import React, { Ref, useEffect, useRef } from 'react';

type InputProps = {
  placeholder?: string;
  ref?: Ref<HTMLInputElement>;
};

function Input({ ref, placeholder }: InputProps) {
  return <input ref={ref} placeholder={placeholder} />;
}

function Parent() {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  return <Input ref={inputRef} placeholder="hello" />;
}

describe('06 ref as prop (React 19)', () => {
  it('parent ref focuses the underlying input', () => {
    render(<Parent />);
    const input = screen.getByPlaceholderText(/hello/i);
    expect(document.activeElement).toBe(input);
  });
});
