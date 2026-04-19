// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import React, { useEffect, useRef } from 'react';

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

function Probe({ value }: { value: number }) {
  const prev = usePrevious(value);
  return <p>current:{value} prev:{prev === undefined ? 'none' : prev}</p>;
}

describe('04 usePrevious', () => {
  it('returns the value from the previous render', () => {
    const { rerender } = render(<Probe value={1} />);
    expect(screen.getByText('current:1 prev:none')).toBeDefined();
    rerender(<Probe value={2} />);
    expect(screen.getByText('current:2 prev:1')).toBeDefined();
    rerender(<Probe value={3} />);
    expect(screen.getByText('current:3 prev:2')).toBeDefined();
  });
});
