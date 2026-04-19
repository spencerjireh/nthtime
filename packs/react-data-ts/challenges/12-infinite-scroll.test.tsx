// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider, useInfiniteQuery } from '@tanstack/react-query';

type Page = {
  items: { id: number; title: string }[];
  nextCursor: number | null;
};

async function fetchPage({
  pageParam = 0,
}: {
  pageParam?: number;
}): Promise<Page> {
  const r = await fetch(`/api/items?cursor=${pageParam}`);
  return r.json() as Promise<Page>;
}

function InfiniteList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['items'],
    queryFn: fetchPage,
    initialPageParam: 0,
    getNextPageParam: (last) => last.nextCursor,
  });

  const items = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div>
      <ul>
        {items.map((i) => (
          <li key={i.id}>{i.title}</li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
      >
        {isFetchingNextPage ? 'Loading...' : 'Load more'}
      </button>
    </div>
  );
}

describe('12 useInfiniteQuery', () => {
  afterEach(() => vi.restoreAllMocks());

  it('paginates and disables the button at the end', async () => {
    globalThis.fetch = vi.fn(async (url: RequestInfo | URL) => {
      const u = String(url);
      if (u.includes('cursor=0')) {
        return {
          json: async () => ({
            items: [{ id: 1, title: 'a' }],
            nextCursor: 1,
          }),
        } as unknown as Response;
      }
      return {
        json: async () => ({
          items: [{ id: 2, title: 'b' }],
          nextCursor: null,
        }),
      } as unknown as Response;
    });

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <InfiniteList />
      </QueryClientProvider>,
    );

    await waitFor(() => expect(screen.getByText('a')).toBeDefined());
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(screen.getByText('b')).toBeDefined());

    const btn = screen.getByRole('button') as HTMLButtonElement;
    await waitFor(() => expect(btn.disabled).toBe(true));
  });
});
