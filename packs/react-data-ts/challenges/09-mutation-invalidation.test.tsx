// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React, { useState, ChangeEvent, FormEvent } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

type Todo = { id: number; title: string };
type NewTodo = { title: string };

async function fetchTodos(): Promise<Todo[]> {
  const r = await fetch('/api/todos');
  return r.json() as Promise<Todo[]>;
}

async function addTodo(input: NewTodo): Promise<Todo> {
  const r = await fetch('/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return r.json() as Promise<Todo>;
}

function TodoBoard() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');

  const { data } = useQuery({ queryKey: ['todos'], queryFn: fetchTodos });

  const mutation = useMutation({
    mutationFn: addTodo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  });

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title) return;
    mutation.mutate({ title });
    setTitle('');
  };

  return (
    <div>
      <ul>
        {data?.map((t) => (
          <li key={t.id}>{t.title}</li>
        ))}
      </ul>
      <form onSubmit={submit}>
        <input
          value={title}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>
    </div>
  );
}

describe('09 Mutate + Invalidate', () => {
  afterEach(() => vi.restoreAllMocks());

  it('refetches the list after a successful mutation', async () => {
    let snapshot: Todo[] = [{ id: 1, title: 'first' }];

    globalThis.fetch = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === 'POST') {
        const created: Todo = { id: 2, title: 'second' };
        snapshot = [...snapshot, created];
        return { json: async () => created } as unknown as Response;
      }
      return { json: async () => snapshot } as unknown as Response;
    });

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <TodoBoard />
      </QueryClientProvider>,
    );

    await waitFor(() => expect(screen.getByText('first')).toBeDefined());
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'second' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    await waitFor(() => expect(screen.getByText('second')).toBeDefined());
  });
});
