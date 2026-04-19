// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import {
  createMemoryRouter,
  RouterProvider,
  Outlet,
  type RouteObject,
} from 'react-router';
import React from 'react';

function DashboardLayout() {
  return (
    <section>
      <h2>shell</h2>
      <Outlet />
    </section>
  );
}

const routes: RouteObject[] = [
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <p>overview</p> },
      { path: 'settings', element: <p>settings</p> },
    ],
  },
];

function makeRouter(initialEntries: string[]) {
  return createMemoryRouter(routes, { initialEntries });
}

describe('02 RR nested routes', () => {
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
