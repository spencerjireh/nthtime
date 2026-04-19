// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  createMemoryRouter,
  RouterProvider,
  useSearchParams,
  type RouteObject,
} from 'react-router';
import React from 'react';

function SearchView() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  return (
    <>
      <input aria-label="q" value={q} onChange={(e) => setParams({ q: e.target.value })} />
      <p>q: {q}</p>
    </>
  );
}

const routes: RouteObject[] = [{ path: '/search', element: <SearchView /> }];

describe('04 RR useSearchParams', () => {
  it('reads existing search', async () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/search?q=hi'] });
    render(<RouterProvider router={router} />);
    await waitFor(() => expect(screen.getByText('q: hi')).toBeDefined());
  });

  it('writes via setParams', async () => {
    const user = userEvent.setup();
    const router = createMemoryRouter(routes, { initialEntries: ['/search'] });
    render(<RouterProvider router={router} />);
    await user.type(screen.getByLabelText('q'), 'a');
    await waitFor(() => expect(screen.getByText('q: a')).toBeDefined());
  });
});
