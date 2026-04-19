// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import React, { useEffect, useState } from 'react';

type Result = { id: number; label: string };

function SearchResults({
  search,
  query,
}: {
  search: (q: string) => Promise<Result[]>;
  query: string;
}) {
  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => {
    let cancelled = false;
    search(query).then((data) => {
      if (!cancelled) setResults(data);
    });
    return () => {
      cancelled = true;
    };
  }, [query, search]);

  return (
    <ol>
      {results.map((r) => (
        <li key={r.id}>{r.label}</li>
      ))}
    </ol>
  );
}

describe('02 Fix the Race Condition', () => {
  it('discards stale results when query changes mid-flight', async () => {
    let resolveSlow!: (v: Result[]) => void;
    const slow = new Promise<Result[]>((res) => {
      resolveSlow = res;
    });
    const fast = Promise.resolve([{ id: 2, label: 'fresh' }]);

    const search = vi.fn((q: string) =>
      q === 'a' ? slow : fast,
    );

    const { rerender } = render(<SearchResults search={search} query="a" />);
    rerender(<SearchResults search={search} query="b" />);
    await waitFor(() => expect(screen.getByText('fresh')).toBeDefined());

    resolveSlow([{ id: 1, label: 'stale' }]);
    await Promise.resolve();
    expect(screen.queryByText('stale')).toBeNull();
    expect(screen.getByText('fresh')).toBeDefined();
  });
});
