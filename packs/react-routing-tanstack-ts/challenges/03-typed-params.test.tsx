// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
  useParams,
  createMemoryHistory,
} from '@tanstack/react-router';
import React from 'react';

const rootRoute = createRootRoute({ component: () => <Outlet /> });

function UserView() {
  const { id } = useParams({ from: userRoute.id });
  return <p>user: {id}</p>;
}

const userRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users/$id',
  parseParams: (p: { id: string }) => ({ id: Number(p.id) }),
  component: UserView,
});

const routeTree = rootRoute.addChildren([userRoute]);

function makeRouter(initialEntries: string[]) {
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries }),
  });
}

describe('03 typed params', () => {
  it('parses :id to a number', async () => {
    render(<RouterProvider router={makeRouter(['/users/42'])} />);
    await waitFor(() => expect(screen.getByText('user: 42')).toBeDefined());
  });
});
