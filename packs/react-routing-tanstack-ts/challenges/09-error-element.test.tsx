// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
  createMemoryHistory,
} from '@tanstack/react-router';
import React from 'react';

const rootRoute = createRootRoute({ component: () => <Outlet /> });

const flakyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/flaky',
  loader: () => {
    throw new Error('boom');
  },
  errorComponent: ({ error }) => <p>err: {(error as Error).message}</p>,
  component: () => <p>flaky-ok</p>,
});

const routeTree = rootRoute.addChildren([flakyRoute]);

function makeRouter(initialEntries: string[]) {
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries }),
  });
}

beforeAll(() => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});
afterAll(() => {
  vi.restoreAllMocks();
});

describe('09 per-route errorComponent', () => {
  it('renders the error UI when the loader throws', async () => {
    render(<RouterProvider router={makeRouter(['/flaky'])} />);
    await waitFor(() => expect(screen.getByText('err: boom')).toBeDefined());
  });
});
