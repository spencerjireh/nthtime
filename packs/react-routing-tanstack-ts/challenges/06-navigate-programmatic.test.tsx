// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
  useNavigate,
  createMemoryHistory,
} from '@tanstack/react-router';
import React from 'react';

const rootRoute = createRootRoute({ component: () => <Outlet /> });

function HomeView() {
  const navigate = useNavigate();
  return <button onClick={() => navigate({ to: '/about' })}>go</button>;
}

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomeView,
});
const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: () => <p>about</p>,
});

const routeTree = rootRoute.addChildren([homeRoute, aboutRoute]);

function makeRouter(initialEntries: string[]) {
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries }),
  });
}

describe('06 useNavigate programmatic', () => {
  it('navigates to /about on button click', async () => {
    const user = userEvent.setup();
    render(<RouterProvider router={makeRouter(['/'])} />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'go' })).toBeDefined());
    await user.click(screen.getByRole('button', { name: 'go' }));
    await waitFor(() => expect(screen.getByText('about')).toBeDefined());
  });
});
