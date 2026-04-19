// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';

type NewTodo = { title: string };
type Todo = { id: number; title: string; done: boolean };

async function addTodo(input: NewTodo): Promise<Todo> {
  const r = await fetch('/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return r.json() as Promise<Todo>;
}

function AddTodo({ onCreated }: { onCreated?: (t: Todo) => void }) {
  const [title, setTitle] = useState('');

  const mutation = useMutation({
    mutationFn: addTodo,
    onSuccess: (t) => onCreated?.(t),
  });

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title) return;
    mutation.mutate({ title });
    setTitle('');
  };

  return (
    <form onSubmit={submit}>
      <input
        value={title}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
      />
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Saving...' : 'Add'}
      </button>
    </form>
  );
}

function withClient(ui: React.ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{ui}</QueryClientProvider>;
}

describe('08 useMutation', () => {
  afterEach(() => vi.restoreAllMocks());

  it('POSTs and calls onCreated', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ id: 1, title: 'milk', done: false }),
    } as unknown as Response);
    const onCreated = vi.fn();

    render(withClient(<AddTodo onCreated={onCreated} />));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'milk' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    await waitFor(() =>
      expect(onCreated).toHaveBeenCalledWith({ id: 1, title: 'milk', done: false }),
    );
    const req = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(req[0]).toBe('/api/todos');
    expect(req[1]).toMatchObject({ method: 'POST' });
  });
});
