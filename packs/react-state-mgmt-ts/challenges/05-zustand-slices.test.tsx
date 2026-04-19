// @vitest-environment jsdom
import { create, StateCreator } from 'zustand';

type CountSlice = { count: number; inc: () => void };
type UserSlice = { user: string | null; setUser: (u: string | null) => void };
type Store = CountSlice & UserSlice;

const createCountSlice: StateCreator<Store, [], [], CountSlice> = (set) => ({
  count: 0,
  inc: () => set((s) => ({ count: s.count + 1 })),
});

const createUserSlice: StateCreator<Store, [], [], UserSlice> = (set) => ({
  user: null,
  setUser: (u) => set({ user: u }),
});

const useStore = create<Store>()((...args) => ({
  ...createCountSlice(...args),
  ...createUserSlice(...args),
}));

describe('05 Zustand slices', () => {
  beforeEach(() => useStore.setState({ count: 0, user: null }));

  it('exposes count actions from the count slice', () => {
    useStore.getState().inc();
    useStore.getState().inc();
    expect(useStore.getState().count).toBe(2);
  });

  it('exposes user actions from the user slice', () => {
    useStore.getState().setUser('Ada');
    expect(useStore.getState().user).toBe('Ada');
  });

  it('shares the same set across slices', () => {
    useStore.getState().inc();
    useStore.getState().setUser('Ada');
    expect(useStore.getState()).toMatchObject({ count: 1, user: 'Ada' });
  });
});
