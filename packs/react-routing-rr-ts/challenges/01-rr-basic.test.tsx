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
  { path: '/about', element: <p>about</p> },
];

function makeRouter(initialEntries: string[]) {
  return createMemoryRouter(routes, { initialEntries });
}

describe('01 RR basic', () => {
  it('renders home at /', async () => {
    render(<RouterProvider router={makeRouter(['/'])} />);
    await waitFor(() => expect(screen.getByText('home')).toBeDefined());
  });

  it('renders about at /about', async () => {
    render(<RouterProvider router={makeRouter(['/about'])} />);
    await waitFor(() => expect(screen.getByText('about')).toBeDefined());
  });
});
