// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import React, { ReactNode } from 'react';

type BoxProps = {
  as?: 'div' | 'section' | 'article';
  children: ReactNode;
};

function Box({ as = 'div', children }: BoxProps) {
  const Tag = as;
  return <Tag>{children}</Tag>;
}

describe('09 Polymorphic as', () => {
  it('defaults to div', () => {
    render(<Box>hello</Box>);
    const content = screen.getByText('hello');
    expect(content.tagName).toBe('DIV');
  });

  it('renders as a section when asked', () => {
    render(<Box as="section">content</Box>);
    expect(screen.getByText('content').tagName).toBe('SECTION');
  });

  it('renders as an article', () => {
    render(<Box as="article">body</Box>);
    expect(screen.getByText('body').tagName).toBe('ARTICLE');
  });
});
