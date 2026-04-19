// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

type Todo = { id: number; title: string; done: boolean };

async function fetchTodos(): Promise<Todo[]> {
  const r = await fetch('/api/todos');
  return r.json() as Promise<Todo[]>;
}

async function toggleTodo(id: number): Promise<Todo> {
  const r = await fetch(`/api/todos/${id}`, { method: 'PATCH' });
  if (!r.ok) throw new Error('toggle failed');
  return r.json() as Promise<Todo>;
}

function TodoToggleList() {
  const queryClient = useQueryClient();

  const { data: todos } = useQuery({ queryKey: ['todos'], queryFn: fetchTodos });

  const mutation = useMutation({
    mutationFn: toggleTodo,
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previous = queryClient.getQueryData<Todo[]>(['todos']);
      queryClient.setQueryData<Todo[]>(['todos'], (old) =>
        (old ?? []).map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
      );
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(['todos'], ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  });

  return (
    <ul>
      {todos?.map((t) => (
        <li key={t.id}>
          <label>
            <input
              type="checkbox"
              checked={t.done}
              onChange={() => mutation.mutate(t.id)}
            />
            {t.title}
          </label>
        </li>
      ))}
    </ul>
  );
}

describe('10 Optimistic Update', () => {
  afterEach(() => vi.restoreAllMocks());

  it('flips the checkbox immediately and rolls back on PATCH failure', async () => {
    const initial: Todo[] = [{ id: 1, title: 'milk', done: false }];

    let rejectPatch!: (err: Error) => void;
    const patchPromise = new Promise<Response>((_, reject) => {
      rejectPatch = reject;
    });

    globalThis.fetch = vi.fn((_url: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === 'PATCH') return patchPromise;
      return Promise.resolve({ json: async () => initial } as unknown as Response);
    }) as unknown as typeof fetch;

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <TodoToggleList />
      </QueryClientProvider>,
    );

    await waitFor(() => expect(screen.getByLabelText('milk')).toBeDefined());
    expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(false);

    fireEvent.click(screen.getByRole('checkbox'));
    await waitFor(() =>
      expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(true),
    );

    rejectPatch(new Error('toggle failed'));
    await waitFor(() =>
      expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(false),
    );
  });
});
