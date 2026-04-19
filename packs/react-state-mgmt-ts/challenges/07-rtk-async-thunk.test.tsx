// @vitest-environment jsdom
import { configureStore, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

type User = { id: number; name: string };
type UsersState = { items: User[]; status: 'idle' | 'loading' | 'success' | 'error' };

const fetchUsers = createAsyncThunk<User[], void>('users/fetch', async () => {
  const r = await fetch('/api/users');
  return r.json() as Promise<User[]>;
});

const usersSlice = createSlice({
  name: 'users',
  initialState: { items: [], status: 'idle' } as UsersState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchUsers.pending, (s) => {
      s.status = 'loading';
    });
    builder.addCase(fetchUsers.fulfilled, (s, a) => {
      s.status = 'success';
      s.items = a.payload;
    });
    builder.addCase(fetchUsers.rejected, (s) => {
      s.status = 'error';
    });
  },
});

function makeStore() {
  return configureStore({ reducer: { users: usersSlice.reducer } });
}

describe('07 RTK createAsyncThunk', () => {
  afterEach(() => vi.restoreAllMocks());

  it('flows pending -> success', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: async () => [{ id: 1, name: 'Ada' }],
    } as unknown as Response);

    const store = makeStore();
    const promise = store.dispatch(fetchUsers());
    expect(store.getState().users.status).toBe('loading');
    await promise;
    expect(store.getState().users.status).toBe('success');
    expect(store.getState().users.items).toEqual([{ id: 1, name: 'Ada' }]);
  });

  it('flows pending -> error', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('nope'));
    const store = makeStore();
    await store.dispatch(fetchUsers());
    expect(store.getState().users.status).toBe('error');
  });
});
