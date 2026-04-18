// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import React, { ReactNode } from 'react';

type PanelProps = {
  title: string;
  children: ReactNode;
};

function Panel({ title, children }: PanelProps) {
  return (
    <section>
      <h2>{title}</h2>
      <div>{children}</div>
    </section>
  );
}

describe('02 Children as ReactNode', () => {
  it('renders the title and string children', () => {
    render(<Panel title="Hello">plain text</Panel>);
    expect(screen.getByRole('heading', { name: /hello/i })).toBeDefined();
    expect(screen.getByText('plain text')).toBeDefined();
  });

  it('accepts JSX children', () => {
    render(
      <Panel title="Items">
        <ul>
          <li>one</li>
          <li>two</li>
        </ul>
      </Panel>,
    );
    expect(screen.getByText('one')).toBeDefined();
    expect(screen.getByText('two')).toBeDefined();
  });

  it('accepts an array of children', () => {
    render(<Panel title="Array">{['a', 'b', 'c'].map((x) => <span key={x}>{x}</span>)}</Panel>);
    expect(screen.getByText('a')).toBeDefined();
    expect(screen.getByText('c')).toBeDefined();
  });
});
