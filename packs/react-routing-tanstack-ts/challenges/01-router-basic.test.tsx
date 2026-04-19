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
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <p>home</p>,
});
const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: () => <p>about</p>,
});

const routeTree = rootRoute.addChildren([indexRoute, aboutRoute]);

function makeRouter(initialEntries: string[]) {
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries }),
  });
}

describe('01 TanStack Router basic', () => {
  it('mounts the index route', async () => {
    render(<RouterProvider router={makeRouter(['/'])} />);
    await waitFor(() => expect(screen.getByText('home')).toBeDefined());
  });

  it('mounts the about route', async () => {
    render(<RouterProvider router={makeRouter(['/about'])} />);
    await waitFor(() => expect(screen.getByText('about')).toBeDefined());
  });
});
