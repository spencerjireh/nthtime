// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import {
  createMemoryRouter,
  RouterProvider,
  useLoaderData,
  type LoaderFunctionArgs,
  type RouteObject,
} from 'react-router';
import React from 'react';

async function todoLoader({
  params,
}: LoaderFunctionArgs): Promise<{ id: number; title: string }> {
  const r = await fetch('/api/todos/' + params.id);
  return r.json();
}

function TodoView() {
  const todo = useLoaderData() as { id: number; title: string };
  return <p>{todo.title}</p>;
}

const routes: RouteObject[] = [
  { path: '/todos/:id', loader: todoLoader, element: <TodoView /> },
];

describe('05 RR loader + useLoaderData', () => {
  afterEach(() => vi.restoreAllMocks());

  it('renders loaded data', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ id: 1, title: 'milk' }),
    } as unknown as Response);

    const router = createMemoryRouter(routes, { initialEntries: ['/todos/1'] });
    render(<RouterProvider router={router} />);
    await waitFor(() => expect(screen.getByText('milk')).toBeDefined());
  });
});
