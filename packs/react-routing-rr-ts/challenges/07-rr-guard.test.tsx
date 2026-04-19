// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import {
  createMemoryRouter,
  RouterProvider,
  redirect,
  type RouteObject,
} from 'react-router';
import React from 'react';

let isAuthed = false;
function setAuthed(v: boolean) {
  isAuthed = v;
}

const routes: RouteObject[] = [
  { path: '/login', element: <p>please log in</p> },
  {
    path: '/profile',
    loader: () => {
      if (!isAuthed) throw redirect('/login');
      return null;
    },
    element: <p>welcome</p>,
  },
];

describe('07 RR loader-based guard', () => {
  it('redirects to /login when not authed', async () => {
    setAuthed(false);
    const router = createMemoryRouter(routes, { initialEntries: ['/profile'] });
    render(<RouterProvider router={router} />);
    await waitFor(() => expect(screen.getByText('please log in')).toBeDefined());
  });

  it('renders /profile when authed', async () => {
    setAuthed(true);
    const router = createMemoryRouter(routes, { initialEntries: ['/profile'] });
    render(<RouterProvider router={router} />);
    await waitFor(() => expect(screen.getByText('welcome')).toBeDefined());
  });
});
