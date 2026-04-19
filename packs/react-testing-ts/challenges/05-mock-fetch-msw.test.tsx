// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import React, { useEffect, useState } from 'react';

type Todo = { id: number; title: string };

function Todos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  useEffect(() => {
    fetch('/api/todos')
      .then((r) => r.json())
      .then((list: Todo[]) => setTodos(list));
  }, []);
  return (
    <ul>
      {todos.map((t) => (
        <li key={t.id}>{t.title}</li>
      ))}
    </ul>
  );
}

const server = setupServer(
  http.get('/api/todos', () => HttpResponse.json([{ id: 1, title: 'milk' }])),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('05 mock fetch via MSW', () => {
  it('renders MSW-served todos', async () => {
    render(<Todos />);
    expect(await screen.findByText('milk')).toBeDefined();
  });
});
