// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

type Todo = { id: number; title: string; done: boolean };

async function fetchTodos(): Promise<Todo[]> {
  const r = await fetch('/api/todos');
  return r.json() as Promise<Todo[]>;
}

function TodoList() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  });

  if (isLoading) return <p>loading</p>;
  if (isError) return <p>error</p>;
  return (
    <ul>
      {data?.map((t) => (
        <li key={t.id}>{t.title}</li>
      ))}
    </ul>
  );
}

function withClient(ui: React.ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{ui}</QueryClientProvider>;
}

describe('06 useQuery basics', () => {
  afterEach(() => vi.restoreAllMocks());

  it('renders loading then data', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: async () => [{ id: 1, title: 'milk', done: false }],
    } as unknown as Response);

    render(withClient(<TodoList />));
    expect(screen.getByText('loading')).toBeDefined();
    await waitFor(() => expect(screen.getByText('milk')).toBeDefined());
  });
});
