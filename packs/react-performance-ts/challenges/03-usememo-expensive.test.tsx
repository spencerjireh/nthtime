// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useMemo, useState, ChangeEvent } from 'react';

let sortCount = 0;
function expensiveSort(items: string[]): string[] {
  sortCount++;
  return items.slice().sort();
}

function SortedList({ items }: { items: string[] }) {
  const [filter, setFilter] = useState<string>('');

  const sorted = useMemo(() => expensiveSort(items), [items]);
  const visible = useMemo(
    () => sorted.filter((s) => s.includes(filter)),
    [sorted, filter],
  );

  return (
    <div>
      <input
        value={filter}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setFilter(e.target.value)}
      />
      <ul>
        {visible.map((v) => (
          <li key={v}>{v}</li>
        ))}
      </ul>
    </div>
  );
}

describe('03 useMemo expensive computation', () => {
  beforeEach(() => {
    sortCount = 0;
  });

  it('only sorts once across filter changes', () => {
    render(<SortedList items={['banana', 'apple', 'cherry']} />);
    expect(sortCount).toBe(1);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'a' } });
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'an' } });
    expect(sortCount).toBe(1);

    expect(screen.getByText('banana')).toBeDefined();
    expect(screen.queryByText('cherry')).toBeNull();
  });
});
