// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  createMemoryRouter,
  RouterProvider,
  useNavigate,
  type RouteObject,
} from 'react-router';
import React from 'react';

function HomeView() {
  const navigate = useNavigate();
  return <button onClick={() => navigate('/about')}>go</button>;
}

const routes: RouteObject[] = [
  { path: '/', element: <HomeView /> },
  { path: '/about', element: <p>about</p> },
];

describe('09 RR useNavigate', () => {
  it('navigates to /about on button click', async () => {
    const user = userEvent.setup();
    const router = createMemoryRouter(routes, { initialEntries: ['/'] });
    render(<RouterProvider router={router} />);
    await user.click(screen.getByRole('button', { name: 'go' }));
    await waitFor(() => expect(screen.getByText('about')).toBeDefined());
  });
});
