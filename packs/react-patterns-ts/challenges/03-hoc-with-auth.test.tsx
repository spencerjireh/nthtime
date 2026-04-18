// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import React, { ComponentType, ReactNode } from 'react';

type AuthUser = { id: string; name: string };

type WithAuthOptions = {
  fallback: ReactNode;
  getUser: () => AuthUser | null;
};

function withAuth<P extends object>(
  Component: ComponentType<P & { user: AuthUser }>,
  options: WithAuthOptions,
): ComponentType<P> {
  function Wrapped(props: P) {
    const user = options.getUser();
    if (user === null) return <>{options.fallback}</>;
    return <Component {...(props as P)} user={user} />;
  }
  Wrapped.displayName = `withAuth(${Component.displayName ?? Component.name ?? 'Component'})`;
  return Wrapped;
}

type DashboardProps = { user: AuthUser; greeting: string };

function Dashboard({ user, greeting }: DashboardProps) {
  return (
    <p>
      {greeting}, {user.name}!
    </p>
  );
}

describe('03 withAuth HOC', () => {
  it('renders fallback when no user', () => {
    const Gated = withAuth<Omit<DashboardProps, 'user'>>(Dashboard, {
      fallback: <p>please sign in</p>,
      getUser: () => null,
    });
    render(<Gated greeting="Hi" />);
    expect(screen.getByText('please sign in')).toBeDefined();
  });

  it('passes the user through when signed in', () => {
    const Gated = withAuth<Omit<DashboardProps, 'user'>>(Dashboard, {
      fallback: <p>please sign in</p>,
      getUser: () => ({ id: '1', name: 'Ada' }),
    });
    render(<Gated greeting="Hi" />);
    expect(screen.getByText(/Hi, Ada!/)).toBeDefined();
  });
});
