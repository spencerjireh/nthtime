// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
  useSearch,
  createMemoryHistory,
} from '@tanstack/react-router';
import { z } from 'zod';
import React from 'react';

const rootRoute = createRootRoute({ component: () => <Outlet /> });

const SearchSchema = z.object({
  page: z.number().int().min(1).default(1),
  q: z.string().default(''),
});

function SearchView() {
  const { page, q } = useSearch({ from: searchRoute.id });
  return (
    <>
      <p>page: {page}</p>
      <p>q: {q}</p>
    </>
  );
}

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search',
  validateSearch: (raw: Record<string, unknown>) => SearchSchema.parse(raw),
  component: SearchView,
});

const routeTree = rootRoute.addChildren([searchRoute]);

function makeRouter(initialEntries: string[]) {
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries }),
  });
}

describe('04 search params via Zod', () => {
  it('reads page+q from validateSearch', async () => {
    render(<RouterProvider router={makeRouter(['/search?page=3&q=react'])} />);
    await waitFor(() => {
      expect(screen.getByText('page: 3')).toBeDefined();
      expect(screen.getByText('q: react')).toBeDefined();
    });
  });

  it('applies schema defaults', async () => {
    render(<RouterProvider router={makeRouter(['/search'])} />);
    await waitFor(() => {
      expect(screen.getByText('page: 1')).toBeDefined();
    });
  });
});
