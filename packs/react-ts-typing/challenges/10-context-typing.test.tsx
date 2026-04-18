// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import React, { createContext, useContext, ReactNode } from 'react';

type User = {
  id: string;
  name: string;
};

const UserContext = createContext<User | null>(null);

type UserProviderProps = {
  user: User;
  children: ReactNode;
};

function UserProvider({ user, children }: UserProviderProps) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

function useUser(): User {
  const user = useContext(UserContext);
  if (user === null) {
    throw new Error('useUser must be used inside <UserProvider>');
  }
  return user;
}

function Greet() {
  const user = useUser();
  return <p>Hello {user.name}</p>;
}

describe('10 Strictly Typed Context', () => {
  it('returns the user inside the provider', () => {
    render(
      <UserProvider user={{ id: '1', name: 'Ada' }}>
        <Greet />
      </UserProvider>,
    );
    expect(screen.getByText(/Hello Ada/)).toBeDefined();
  });

  it('throws when used outside the provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Greet />)).toThrow(/useUser must be used inside/);
    spy.mockRestore();
  });
});
