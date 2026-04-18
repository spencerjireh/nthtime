// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useState, useTransition } from 'react';

function SearchableList({ items }: { items: string[] }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>(items);
  const [, startTransition] = useTransition();

  function handleChange(value: string) {
    setQuery(value);
    startTransition(() => {
      const next = items.filter((item) => item.toLowerCase().includes(value.toLowerCase()));
      setResults(next);
    });
  }

  return (
    <div>
      <input value={query} onChange={(e) => handleChange(e.target.value)} />
      <ul>
        {results.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
    </div>
  );
}

describe('05 useTransition', () => {
  it('filters items as the user types', async () => {
    render(<SearchableList items={['apple', 'banana', 'cherry', 'grape']} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'an' } });
    // Transition updates may be deferred; wait until list settles.
    await screen.findByText('banana');
    expect(screen.queryByText('apple')).toBeNull();
    expect(screen.queryByText('cherry')).toBeNull();
  });
});
