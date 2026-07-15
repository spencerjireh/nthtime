import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';

const mockFetchSession = vi.fn();
const mockAuthEnabled = { value: true };

vi.mock('@/lib/api-client', () => ({
  fetchSession: (...args: unknown[]) => mockFetchSession(...args),
}));

vi.mock('@/lib/feature-flags', () => ({
  isFeatureEnabled: (flag: string) => (flag === 'auth' ? mockAuthEnabled.value : true),
}));

import { useAuthSession } from './use-auth-session';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

beforeEach(() => {
  mockFetchSession.mockReset();
  mockAuthEnabled.value = true;
});

describe('useAuthSession', () => {
  it('reports unauthenticated without fetching when the auth flag is off', async () => {
    mockAuthEnabled.value = false;

    const { result } = renderHook(() => useAuthSession(), { wrapper: createWrapper() });

    expect(result.current.status).toBe('unauthenticated');
    expect(result.current.userId).toBeNull();
    expect(mockFetchSession).not.toHaveBeenCalled();
  });

  it('does not get stuck in loading when the auth flag is off', async () => {
    mockAuthEnabled.value = false;

    const { result } = renderHook(() => useAuthSession(), { wrapper: createWrapper() });

    // A disabled TanStack query reports isLoading: true indefinitely, so the flag
    // has to be checked ahead of it.
    expect(result.current.status).not.toBe('loading');
  });

  it('reports authenticated with the user id when the session resolves', async () => {
    mockFetchSession.mockResolvedValue({ authenticated: true, userId: 'user-1' });

    const { result } = renderHook(() => useAuthSession(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.status).toBe('authenticated'));
    expect(result.current.userId).toBe('user-1');
  });

  it('reports unauthenticated when the session says so', async () => {
    mockFetchSession.mockResolvedValue({ authenticated: false });

    const { result } = renderHook(() => useAuthSession(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.status).toBe('unauthenticated'));
    expect(result.current.userId).toBeNull();
  });
});
