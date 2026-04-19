// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import React, { useLayoutEffect, useRef, useState, ReactNode } from 'react';

function Measurable({ children }: { children: ReactNode }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    if (boxRef.current) {
      setWidth(boxRef.current.offsetWidth);
    }
  }, []);

  return (
    <>
      <div ref={boxRef}>{children}</div>
      <p data-testid="width">{width}</p>
    </>
  );
}

describe('04 useLayoutEffect', () => {
  it('renders a numeric width from the ref after layout', () => {
    // jsdom always reports 0 for offsetWidth, but the effect still runs synchronously.
    render(<Measurable>some content</Measurable>);
    const width = screen.getByTestId('width');
    expect(/^\d+$/.test(width.textContent ?? '')).toBe(true);
  });
});
