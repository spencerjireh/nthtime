// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import React, { useEffect, useState } from 'react';

type Article = { id: number; title: string };

type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

function ArticleList({ url }: { url: string }) {
  const [state, setState] = useState<AsyncState<Article[]>>({ status: 'idle' });

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });
    fetch(url)
      .then((r) => r.json() as Promise<Article[]>)
      .then((data) => {
        if (!cancelled) setState({ status: 'success', data });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({
          status: 'error',
          error: err instanceof Error ? err : new Error(String(err)),
        });
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (state.status === 'idle') return null;
  if (state.status === 'loading') return <p>loading...</p>;
  if (state.status === 'error') return <p>error: {state.error.message}</p>;
  return (
    <ul>
      {state.data.map((a) => (
        <li key={a.id}>{a.title}</li>
      ))}
    </ul>
  );
}

describe('05 Loading / Error / Data', () => {
  afterEach(() => vi.restoreAllMocks());

  it('shows loading then data', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: async () => [{ id: 1, title: 'one' }],
    } as unknown as Response);
    render(<ArticleList url="/api/a" />);
    expect(screen.getByText('loading...')).toBeDefined();
    await waitFor(() => expect(screen.getByText('one')).toBeDefined());
  });

  it('shows error on rejection', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('boom'));
    render(<ArticleList url="/api/b" />);
    await waitFor(() => expect(screen.getByText('error: boom')).toBeDefined());
  });
});
