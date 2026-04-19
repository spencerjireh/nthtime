// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import React from 'react';
import { FixedSizeList, ListChildComponentProps } from 'react-window';

type Row = { id: number; label: string };

function BigList({ rows }: { rows: Row[] }) {
  const Item = ({ index, style }: ListChildComponentProps) => (
    <div style={style} data-index={index}>
      {rows[index].label}
    </div>
  );

  return (
    <FixedSizeList height={400} width={300} itemSize={32} itemCount={rows.length}>
      {Item}
    </FixedSizeList>
  );
}

describe('08 Virtualize with react-window', () => {
  it('renders only the visible window of a 10k-row list', () => {
    const rows: Row[] = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      label: `row ${i}`,
    }));

    const { container } = render(<BigList rows={rows} />);
    const items = container.querySelectorAll('[data-index]');

    expect(items.length).toBeGreaterThan(0);
    expect(items.length).toBeLessThan(50);
    expect(screen.getByText('row 0')).toBeDefined();
    expect(screen.queryByText('row 9999')).toBeNull();
  });
});
