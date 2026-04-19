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

function SlowView() {
  const data = useLoaderData({ from: slowRoute.id });
  return <p>{data.value}</p>;
}

const slowRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/slow',
  pendingMs: 0,
  pendingComponent: () => <p>loading</p>,
  loader: () =>
    new Promise<{ value: string }>((resolve) => setTimeout(() => resolve({ value: 'done' }), 50)),
  component: SlowView,
});

const routeTree = rootRoute.addChildren([slowRoute]);

function makeRouter(initialEntries: string[]) {
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries }),
  });
}

describe('10 pending UI', () => {
  it('eventually renders the loaded content', async () => {
    render(<RouterProvider router={makeRouter(['/slow'])} />);
    await waitFor(() => expect(screen.getByText('done')).toBeDefined(), { timeout: 2000 });
  });
});
