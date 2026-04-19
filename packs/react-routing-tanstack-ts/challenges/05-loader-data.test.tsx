// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
  useLoaderData,
  createMemoryHistory,
} from '@tanstack/react-router';
import React from 'react';

const rootRoute = createRootRoute({ component: () => <Outlet /> });

async function fetchTodo(id: number): Promise<{ id: number; title: string }> {
  const r = await fetch('/api/todos/' + id);
  return r.json();
}

function TodoView() {
  const todo = useLoaderData({ from: todoRoute.id });
  return <p>{todo.title}</p>;
}

const todoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/todos/$id',
  parseParams: (p: { id: string }) => ({ id: Number(p.id) }),
  loader: ({ params }) => fetchTodo(params.id),
  component: TodoView,
});

const routeTree = rootRoute.addChildren([todoRoute]);

function makeRouter(initialEntries: string[]) {
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries }),
  });
}

describe('05 loader data', () => {
  afterEach(() => vi.restoreAllMocks());

  it('renders loaded data from the route loader', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ id: 1, title: 'milk' }),
    } as unknown as Response);

    render(<RouterProvider router={makeRouter(['/todos/1'])} />);
    await waitFor(() => expect(screen.getByText('milk')).toBeDefined());
  });
});
