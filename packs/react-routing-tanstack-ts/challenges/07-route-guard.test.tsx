// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
  redirect,
  createMemoryHistory,
} from '@tanstack/react-router';
import React from 'react';

let isAuthed = false;
function setAuthed(v: boolean) {
  isAuthed = v;
}

const rootRoute = createRootRoute({ component: () => <Outlet /> });

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: () => <p>please log in</p>,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  beforeLoad: () => {
    if (!isAuthed) throw redirect({ to: '/login' });
  },
  component: () => <p>welcome</p>,
});

const routeTree = rootRoute.addChildren([loginRoute, profileRoute]);

function makeRouter(initialEntries: string[]) {
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries }),
  });
}

describe('07 route guard', () => {
  it('redirects to /login when not authed', async () => {
    setAuthed(false);
    render(<RouterProvider router={makeRouter(['/profile'])} />);
    await waitFor(() => expect(screen.getByText('please log in')).toBeDefined());
  });

  it('renders /profile when authed', async () => {
    setAuthed(true);
    render(<RouterProvider router={makeRouter(['/profile'])} />);
    await waitFor(() => expect(screen.getByText('welcome')).toBeDefined());
  });
});
