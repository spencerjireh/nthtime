// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import {
  createMemoryRouter,
  RouterProvider,
  useRouteError,
  type RouteObject,
} from 'react-router';
import React from 'react';

function RouteError() {
  const err = useRouteError() as Error;
  return <p>err: {err.message}</p>;
}

const routes: RouteObject[] = [
  { path: '/', element: <p>home</p> },
  { path: '*', element: <p>not-found</p> },
  {
    path: '/boom',
    loader: () => {
      throw new Error('kapow');
    },
    element: <p>boom-ok</p>,
    errorElement: <RouteError />,
  },
];

beforeAll(() => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});
afterAll(() => {
  vi.restoreAllMocks();
});

describe('08 RR splat + errorElement', () => {
  it('renders not-found for unknown URLs', async () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/nope'] });
    render(<RouterProvider router={router} />);
    await waitFor(() => expect(screen.getByText('not-found')).toBeDefined());
  });

  it('renders the route error UI when loader throws', async () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/boom'] });
    render(<RouterProvider router={router} />);
    await waitFor(() => expect(screen.getByText('err: kapow')).toBeDefined());
  });
});
