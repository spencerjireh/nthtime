// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  createMemoryRouter,
  RouterProvider,
  useSearchParams,
  type RouteObject,
} from 'react-router';
import React from 'react';

function FilterList({ items }: { items: string[] }) {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const filtered = items.filter((i) => i.includes(q));
  return (
    <>
      <input aria-label="q" value={q} onChange={(e) => setParams({ q: e.target.value })} />
      <ul>
        {filtered.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </>
  );
}

const routes: RouteObject[] = [
  { path: '/', element: <FilterList items={['apple', 'banana', 'avocado']} /> },
];

describe('09 URL as state', () => {
  it('reads q from URL', () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/?q=av'] });
    render(<RouterProvider router={router} />);
    expect(screen.getByText('avocado')).toBeDefined();
    expect(screen.queryByText('banana')).toBeNull();
  });

  it('writes q to URL via input', async () => {
    const user = userEvent.setup();
    const router = createMemoryRouter(routes, { initialEntries: ['/'] });
    render(<RouterProvider router={router} />);
    await user.type(screen.getByLabelText('q'), 'av');
    expect(screen.getByText('avocado')).toBeDefined();
  });
});
