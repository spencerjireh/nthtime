// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';

type Todo = { id: number; title: string; done: boolean };

function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const add = (t: Todo) => setTodos((prev) => [...prev, t]);
  return { todos, add };
}

function TodoList() {
  const { todos, add } = useTodos();
  return (
    <>
      <button onClick={() => add({ id: Date.now(), title: 'new', done: false })}>add</button>
      <ul>
        {todos.map((t) => (
          <li key={t.id}>{t.title}</li>
        ))}
      </ul>
    </>
  );
}

describe('01 feature module', () => {
  it('uses the co-located hook to add a todo', async () => {
    const user = userEvent.setup();
    render(<TodoList />);
    await user.click(screen.getByRole('button', { name: 'add' }));
    expect(screen.getByText('new')).toBeDefined();
  });
});
