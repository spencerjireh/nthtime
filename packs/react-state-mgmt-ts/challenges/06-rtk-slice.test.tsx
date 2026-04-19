// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import React from 'react';

type Todo = { id: number; title: string; done: boolean };

const todosSlice = createSlice({
  name: 'todos',
  initialState: [] as Todo[],
  reducers: {
    add: (state, action: PayloadAction<Todo>) => {
      state.push(action.payload);
    },
    toggle: (state, action: PayloadAction<number>) => {
      const t = state.find((x) => x.id === action.payload);
      if (t) t.done = !t.done;
    },
  },
});

const { add, toggle } = todosSlice.actions;

function makeStore() {
  return configureStore({ reducer: { todos: todosSlice.reducer } });
}

type RootState = ReturnType<ReturnType<typeof makeStore>['getState']>;
type AppDispatch = ReturnType<typeof makeStore>['dispatch'];

function TodoList() {
  const todos = useSelector((s: RootState) => s.todos);
  const dispatch = useDispatch<AppDispatch>();
  return (
    <>
      <button onClick={() => dispatch(add({ id: 1, title: 'milk', done: false }))}>add</button>
      <ul>
        {todos.map((t) => (
          <li key={t.id}>
            <button onClick={() => dispatch(toggle(t.id))}>{t.done ? 'x' : 'o'}</button>
            <span>{t.title}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

describe('06 RTK createSlice', () => {
  it('adds a todo', async () => {
    const user = userEvent.setup();
    render(
      <Provider store={makeStore()}>
        <TodoList />
      </Provider>,
    );
    await user.click(screen.getByRole('button', { name: 'add' }));
    expect(screen.getByText('milk')).toBeDefined();
  });

  it('toggles a todo', async () => {
    const user = userEvent.setup();
    render(
      <Provider store={makeStore()}>
        <TodoList />
      </Provider>,
    );
    await user.click(screen.getByRole('button', { name: 'add' }));
    await user.click(screen.getByRole('button', { name: 'o' }));
    expect(screen.getByRole('button', { name: 'x' })).toBeDefined();
  });
});
