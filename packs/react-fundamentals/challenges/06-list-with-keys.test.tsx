// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import React, { useState } from 'react';

// Inline reference solution (from 06-list-with-keys.json)
function TodoList() {
  const [todos] = useState([
    { id: 1, text: 'Learn React' },
    { id: 2, text: 'Build a project' },
    { id: 3, text: 'Deploy' },
  ]);

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}

describe('06 List with Keys', () => {
  it('renders all todo items', () => {
    render(<TodoList />);
    expect(screen.getByText('Learn React')).toBeDefined();
    expect(screen.getByText('Build a project')).toBeDefined();
    expect(screen.getByText('Deploy')).toBeDefined();
  });

  it('renders items as list elements', () => {
    render(<TodoList />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
  });
});
