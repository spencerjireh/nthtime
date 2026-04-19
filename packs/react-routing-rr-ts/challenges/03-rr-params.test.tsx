// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import {
  createMemoryRouter,
  RouterProvider,
  useParams,
  type RouteObject,
} from 'react-router';
import React from 'react';

function UserView() {
  const { id } = useParams<{ id: string }>();
  return <p>user: {id}</p>;
}

const routes: RouteObject[] = [{ path: '/users/:id', element: <UserView /> }];

describe('03 RR useParams', () => {
  it('reads :id from the URL', async () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/users/42'] });
    render(<RouterProvider router={router} />);
    await waitFor(() => expect(screen.getByText('user: 42')).toBeDefined());
  });
});
