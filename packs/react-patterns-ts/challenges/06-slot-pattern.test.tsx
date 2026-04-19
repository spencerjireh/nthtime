// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import React, { ReactNode } from 'react';

type CardProps = {
  header: ReactNode;
  body: ReactNode;
  footer?: ReactNode;
};

function Card({ header, body, footer }: CardProps) {
  return (
    <article>
      <header>{header}</header>
      <div data-slot="body">{body}</div>
      {footer ? <footer>{footer}</footer> : null}
    </article>
  );
}

describe('06 Slot Pattern', () => {
  it('renders all provided slots', () => {
    render(<Card header={<h1>Title</h1>} body={<p>main</p>} footer={<small>meta</small>} />);
    expect(screen.getByRole('heading', { name: 'Title' })).toBeDefined();
    expect(screen.getByText('main')).toBeDefined();
    expect(screen.getByText('meta')).toBeDefined();
  });

  it('omits the optional footer slot', () => {
    render(<Card header="Title" body="main" />);
    expect(document.querySelector('footer')).toBeNull();
  });
});
