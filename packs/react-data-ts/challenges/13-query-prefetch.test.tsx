// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';

type Article = { id: number; title: string; body: string };

async function fetchArticle(id: number): Promise<Article> {
  const r = await fetch(`/api/articles/${id}`);
  return r.json() as Promise<Article>;
}

function ArticleLink({ id, label }: { id: number; label: string }) {
  const queryClient = useQueryClient();

  const prefetch = () => {
    queryClient.prefetchQuery({
      queryKey: ['article', id],
      queryFn: () => fetchArticle(id),
    });
  };

  return (
    <a href={`/articles/${id}`} onMouseEnter={prefetch} onFocus={prefetch}>
      {label}
    </a>
  );
}

describe('13 Prefetch on Hover', () => {
  afterEach(() => vi.restoreAllMocks());

  it('warms the cache on mouseenter', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ id: 5, title: 'x', body: 'y' }),
    } as unknown as Response);

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <ArticleLink id={5} label="Read" />
      </QueryClientProvider>,
    );

    expect(client.getQueryData(['article', 5])).toBeUndefined();
    fireEvent.mouseEnter(screen.getByRole('link', { name: 'Read' }));
    await waitFor(() =>
      expect(client.getQueryData(['article', 5])).toEqual({ id: 5, title: 'x', body: 'y' }),
    );
  });
});
