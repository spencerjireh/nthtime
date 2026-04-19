// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import React, { lazy, Suspense } from 'react';

const Home = lazy(async () => ({ default: () => <p>home</p> }));
const Settings = lazy(async () => ({ default: () => <p>settings</p> }));

function App({ page }: { page: 'home' | 'settings' }) {
  return (
    <Suspense fallback={<p>loading</p>}>
      {page === 'home' ? <Home /> : <Settings />}
    </Suspense>
  );
}

describe('09 route-level codesplit', () => {
  it('renders home lazily', async () => {
    render(<App page="home" />);
    await waitFor(() => expect(screen.getByText('home')).toBeDefined());
  });

  it('renders settings lazily', async () => {
    render(<App page="settings" />);
    await waitFor(() => expect(screen.getByText('settings')).toBeDefined());
  });
});
