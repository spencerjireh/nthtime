// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import React, { ReactNode } from 'react';

type ListProps<T> = {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  getKey: (item: T) => string | number;
};

function List<T,>({ items, renderItem, getKey }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={getKey(item)}>{renderItem(item, index)}</li>
      ))}
    </ul>
  );
}

describe('08 Generic List', () => {
  it('renders strings', () => {
    render(<List items={['a', 'b', 'c']} renderItem={(x) => x.toUpperCase()} getKey={(x) => x} />);
    expect(screen.getByText('A')).toBeDefined();
    expect(screen.getByText('C')).toBeDefined();
  });

  it('renders objects with custom key + render', () => {
    const users = [
      { id: 1, name: 'Ada' },
      { id: 2, name: 'Linus' },
    ];
    render(
      <List
        items={users}
        getKey={(u) => u.id}
        renderItem={(u) => <span data-testid={`user-${u.id}`}>{u.name}</span>}
      />,
    );
    expect(screen.getByTestId('user-1').textContent).toBe('Ada');
    expect(screen.getByTestId('user-2').textContent).toBe('Linus');
  });
});
