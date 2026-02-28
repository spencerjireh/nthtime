// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useReducer, useState } from 'react';

// Inline reference solution (from 10-usereducer-todo.json)
interface Todo {
  id: number;
  text: string;
  done: boolean;
}

type Action = { type: 'add'; text: string } | { type: 'toggle'; id: number };

function todoReducer(state: Todo[], action: Action): Todo[] {
  switch (action.type) {
    case 'add':
      return [...state, { id: Date.now(), text: action.text, done: false }];
    case 'toggle':
      return state.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t));
    default:
      return state;
  }
}

function TodoApp() {
  const [todos, dispatch] = useReducer(todoReducer, []);
  const [text, setText] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (text.trim()) {
      dispatch({ type: 'add', text });
      setText('');
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input value={text} onChange={(e) => setText(e.target.value)} />
        <button type="submit">Add</button>
      </form>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id} onClick={() => dispatch({ type: 'toggle', id: todo.id })}>
            {todo.done ? <s>{todo.text}</s> : todo.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

describe('10 useReducer Todo', () => {
  it('adds a todo via form submission', () => {
    render(<TodoApp />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Buy milk' } });
    fireEvent.click(screen.getByRole('button', { name: /add/i }));

    expect(screen.getByText('Buy milk')).toBeDefined();
  });

  it('clears input after adding', () => {
    render(<TodoApp />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Test' } });
    fireEvent.click(screen.getByRole('button', { name: /add/i }));

    expect(input.value).toBe('');
  });

  it('toggles todo done state on click', () => {
    render(<TodoApp />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Walk dog' } });
    fireEvent.click(screen.getByRole('button', { name: /add/i }));

    const item = screen.getByText('Walk dog');
    fireEvent.click(item);

    // After toggle, text should be wrapped in <s> (strikethrough)
    const listItem = screen.getByRole('listitem');
    expect(listItem.querySelector('s')).not.toBeNull();
    expect(listItem.querySelector('s')?.textContent).toBe('Walk dog');
  });

  it('does not add empty todos', () => {
    render(<TodoApp />);
    fireEvent.click(screen.getByRole('button', { name: /add/i }));

    const items = screen.queryAllByRole('listitem');
    expect(items).toHaveLength(0);
  });
});
