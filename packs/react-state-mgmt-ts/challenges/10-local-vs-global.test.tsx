// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { create } from 'zustand';
import React, { useState } from 'react';

type AuthUser = { id: number; name: string };

const useAuthStore = create<{
  user: AuthUser | null;
  setUser: (u: AuthUser | null) => void;
}>()((set) => ({
  user: null,
  setUser: (u) => set({ user: u }),
}));

function Modal() {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>open</button>
      {open ? (
        <dialog open>
          <p>hi</p>
          <button onClick={() => setOpen(false)}>close</button>
        </dialog>
      ) : null}
    </>
  );
}

function Header() {
  const user = useAuthStore((s) => s.user);
  return <header>{user ? <p>signed in: {user.name}</p> : <p>guest</p>}</header>;
}

beforeEach(() => useAuthStore.setState({ user: null }));

describe('10 local vs global', () => {
  it('opens and closes the modal locally', async () => {
    const user = userEvent.setup();
    render(<Modal />);
    expect(screen.queryByText('hi')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'open' }));
    expect(screen.getByText('hi')).toBeDefined();
    await user.click(screen.getByRole('button', { name: 'close' }));
    expect(screen.queryByText('hi')).toBeNull();
  });

  it('reflects global auth in Header', () => {
    useAuthStore.getState().setUser({ id: 1, name: 'Ada' });
    render(<Header />);
    expect(screen.getByText('signed in: Ada')).toBeDefined();
  });
});
