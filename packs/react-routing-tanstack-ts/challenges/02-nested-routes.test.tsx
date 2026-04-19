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
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: () => (
    <section>
      <h2>shell</h2>
      <Outlet />
    </section>
  ),
});
const dashboardIndexRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: '/',
  component: () => <p>overview</p>,
});
const settingsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'settings',
  component: () => <p>settings</p>,
});

const routeTree = rootRoute.addChildren([
  dashboardRoute.addChildren([dashboardIndexRoute, settingsRoute]),
]);

function makeRouter(initialEntries: string[]) {
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries }),
  });
}

describe('02 nested routes', () => {
  it('renders shell + overview at /dashboard', async () => {
    render(<RouterProvider router={makeRouter(['/dashboard'])} />);
    await waitFor(() => {
      expect(screen.getByText('shell')).toBeDefined();
      expect(screen.getByText('overview')).toBeDefined();
    });
  });

  it('renders shell + settings at /dashboard/settings', async () => {
    render(<RouterProvider router={makeRouter(['/dashboard/settings'])} />);
    await waitFor(() => {
      expect(screen.getByText('shell')).toBeDefined();
      expect(screen.getByText('settings')).toBeDefined();
    });
  });
});
