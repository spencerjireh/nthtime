// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import React from 'react';

type Todo = { id: number; title: string };

const todosApi = createApi({
  reducerPath: 'todosApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost/api/' }),
  endpoints: (builder) => ({
    getTodos: builder.query<Todo[], void>({
      query: () => 'todos',
    }),
  }),
});

const { useGetTodosQuery } = todosApi;

function makeStore() {
  return configureStore({
    reducer: { [todosApi.reducerPath]: todosApi.reducer },
    middleware: (gdm) => gdm().concat(todosApi.middleware),
  });
}

function TodoList() {
  const { data, isLoading } = useGetTodosQuery();
  if (isLoading) return <p>loading</p>;
  return (
    <ul>
      {data?.map((t) => (
        <li key={t.id}>{t.title}</li>
      ))}
    </ul>
  );
}

const server = setupServer(
  http.get('http://localhost/api/todos', () =>
    HttpResponse.json([{ id: 1, title: 'milk' }]),
  ),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('08 RTK Query basic', () => {
  it('fetches and renders todos', async () => {
    render(
      <Provider store={makeStore()}>
        <TodoList />
      </Provider>,
    );
    expect(screen.getByText('loading')).toBeDefined();
    await waitFor(() => expect(screen.getByText('milk')).toBeDefined());
  });
});
