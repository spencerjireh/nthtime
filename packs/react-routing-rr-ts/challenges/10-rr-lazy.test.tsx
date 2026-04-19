// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import {
  createMemoryRouter,
  RouterProvider,
  type RouteObject,
} from 'react-router';
import React from 'react';

const routes: RouteObject[] = [
  { path: '/', element: <p>home</p> },
  { path: '/heavy', lazy: async () => ({ element: <p>heavy</p> }) },
];

describe('10 RR route-level lazy', () => {
  it('resolves the lazy route', async () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/heavy'] });
    render(<RouterProvider router={router} />);
    await waitFor(() => expect(screen.getByText('heavy')).toBeDefined());
  });
});
