// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import React, { useImperativeHandle, useRef, Ref, useEffect } from 'react';

type FancyInputHandle = {
  focus: () => void;
};

function FancyInput({ ref }: { ref?: Ref<FancyInputHandle> }) {
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        inputRef.current?.focus();
      },
    }),
    [],
  );

  return <input ref={inputRef} placeholder="fancy" />;
}

function Host() {
  const handleRef = useRef<FancyInputHandle>(null);
  useEffect(() => {
    handleRef.current?.focus();
  }, []);
  return <FancyInput ref={handleRef} />;
}

describe('08 useImperativeHandle', () => {
  it('parent can focus the input via the exposed handle', () => {
    render(<Host />);
    expect(document.activeElement).toBe(screen.getByPlaceholderText('fancy'));
  });
});
