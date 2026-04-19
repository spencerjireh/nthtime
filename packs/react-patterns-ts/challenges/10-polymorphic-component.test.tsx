// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import React, { Ref, ReactNode, useRef, useEffect } from 'react';

type TextProps = {
  as?: 'p' | 'span' | 'div';
  children: ReactNode;
  ref?: Ref<HTMLElement>;
};

function Text({ as = 'p', children, ref }: TextProps) {
  const Tag = as;
  return <Tag ref={ref as Ref<HTMLElement>}>{children}</Tag>;
}

function Parent() {
  const spanRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (spanRef.current) spanRef.current.dataset.attached = 'yes';
  }, []);
  return (
    <>
      <Text as="p">paragraph</Text>
      <Text as="span" ref={spanRef}>
        spanny
      </Text>
    </>
  );
}

describe('10 Polymorphic + Ref Forwarding', () => {
  it('renders as the chosen tag and attaches the ref', () => {
    render(<Parent />);
    expect(screen.getByText('paragraph').tagName).toBe('P');
    const span = screen.getByText('spanny') as HTMLSpanElement;
    expect(span.tagName).toBe('SPAN');
    expect(span.dataset.attached).toBe('yes');
  });
});
