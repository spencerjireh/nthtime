// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useState, useDeferredValue } from 'react';

function LiveSearch({ items }: { items: string[] }) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  const results = items.filter((i) =>
    i.toLowerCase().includes(deferredQuery.toLowerCase()),
  );

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <ul>
        {results.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
    </div>
  );
}

describe('06 useDeferredValue', () => {
  it('filters results eventually', async () => {
    render(<LiveSearch items={['apple', 'banana', 'cherry']} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ch' } });
    await screen.findByText('cherry');
    expect(screen.queryByText('apple')).toBeNull();
  });
});
