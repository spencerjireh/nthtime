// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  Dispatch,
} from 'react';

type Todo = { id: number; text: string; done: boolean };

type TodoAction = { type: 'add'; text: string } | { type: 'toggle'; id: number };

function todosReducer(state: Todo[], action: TodoAction): Todo[] {
  switch (action.type) {
    case 'add':
      return [...state, { id: state.length + 1, text: action.text, done: false }];
    case 'toggle':
      return state.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t));
  }
}

const TodosContext = createContext<Todo[] | null>(null);
const TodosDispatchContext = createContext<Dispatch<TodoAction> | null>(null);

function TodosProvider({ children }: { children: ReactNode }) {
  const [todos, dispatch] = useReducer(todosReducer, []);
  return (
    <TodosContext.Provider value={todos}>
      <TodosDispatchContext.Provider value={dispatch}>{children}</TodosDispatchContext.Provider>
    </TodosContext.Provider>
  );
}

function useTodos(): Todo[] {
  const todos = useContext(TodosContext);
  if (todos === null) throw new Error('useTodos must be used inside <TodosProvider>');
  return todos;
}

function useTodosDispatch(): Dispatch<TodoAction> {
  const dispatch = useContext(TodosDispatchContext);
  if (dispatch === null)
    throw new Error('useTodosDispatch must be used inside <TodosProvider>');
  return dispatch;
}

function List() {
  const todos = useTodos();
  const dispatch = useTodosDispatch();
  return (
    <div>
      {todos.map((t) => (
        <button key={t.id} onClick={() => dispatch({ type: 'toggle', id: t.id })}>
          {t.done ? 'x' : 'o'} {t.text}
        </button>
      ))}
      <button onClick={() => dispatch({ type: 'add', text: 'new' })}>add</button>
    </div>
  );
}

describe('03 Context + Reducer', () => {
  it('adds and toggles todos', () => {
    render(
      <TodosProvider>
        <List />
      </TodosProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'add' }));
    fireEvent.click(screen.getByRole('button', { name: /o new/i }));
    expect(screen.getByRole('button', { name: /x new/i })).toBeDefined();
  });

  it('throws when the hook runs outside the provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<List />)).toThrow(/TodosProvider/);
    spy.mockRestore();
  });
});
