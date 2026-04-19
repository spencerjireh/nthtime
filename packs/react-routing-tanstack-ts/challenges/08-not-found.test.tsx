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

const rootRoute = createRootRoute({
  component: () => <Outlet />,
  notFoundComponent: () => <p>not-found</p>,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <p>home</p>,
});

const routeTree = rootRoute.addChildren([homeRoute]);

function makeRouter(initialEntries: string[]) {
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries }),
  });
}

describe('08 notFoundComponent', () => {
  it('renders not-found for unknown paths', async () => {
    render(<RouterProvider router={makeRouter(['/nope'])} />);
    await waitFor(() => expect(screen.getByText('not-found')).toBeDefined());
  });

  it('renders home for /', async () => {
    render(<RouterProvider router={makeRouter(['/'])} />);
    await waitFor(() => expect(screen.getByText('home')).toBeDefined());
  });
});
