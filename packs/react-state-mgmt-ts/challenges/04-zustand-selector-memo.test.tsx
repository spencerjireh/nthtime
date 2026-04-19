// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { create } from 'zustand';
import React from 'react';

type Profile = {
  name: string;
  age: number;
  setName: (n: string) => void;
  birthday: () => void;
};

const useStore = create<Profile>()((set) => ({
  name: '',
  age: 30,
  setName: (n) => set({ name: n }),
  birthday: () => set((s) => ({ age: s.age + 1 })),
}));

function Greet() {
  const name = useStore((s) => s.name);
  return <p>hi, {name}</p>;
}

function NameInput() {
  const setName = useStore((s) => s.setName);
  return <input aria-label="name" onChange={(e) => setName(e.target.value)} />;
}

beforeEach(() => useStore.setState({ name: '', age: 30 }));

describe('04 Zustand selector', () => {
  it('updates the name slice', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Greet />
        <NameInput />
      </>,
    );
    await user.type(screen.getByLabelText('name'), 'Ada');
    expect(screen.getByText('hi, Ada')).toBeDefined();
  });
});
