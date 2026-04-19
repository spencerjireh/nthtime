// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider, useQuery, UseQueryResult } from '@tanstack/react-query';

type Todo = { id: number; title: string; done: boolean };

const todoKeys = {
  all: () => ['todos'] as const,
  lists: () => [...todoKeys.all(), 'list'] as const,
  detail: (id: number) => [...todoKeys.all(), 'detail', id] as const,
};

async function fetchTodos(): Promise<Todo[]> {
  const r = await fetch('/api/todos');
  return r.json() as Promise<Todo[]>;
}

function useTodos(): UseQueryResult<Todo[]> {
  return useQuery({
    queryKey: todoKeys.lists(),
    queryFn: fetchTodos,
  });
}

describe('07 Query Key Factory', () => {
  afterEach(() => vi.restoreAllMocks());

  it('produces hierarchical keys', () => {
    expect(todoKeys.all()).toEqual(['todos']);
    expect(todoKeys.lists()).toEqual(['todos', 'list']);
    expect(todoKeys.detail(7)).toEqual(['todos', 'detail', 7]);
  });

  it('useTodos uses the lists key', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: async () => [{ id: 1, title: 'a', done: false }],
    } as unknown as Response);

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useTodos(), { wrapper });
    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(client.getQueryData(todoKeys.lists())).toEqual([{ id: 1, title: 'a', done: false }]);
  });
});
