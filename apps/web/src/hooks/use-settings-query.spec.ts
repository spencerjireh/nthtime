import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { createSettingsStore } from '@/lib/settings-store';

const mockFetchSettings = vi.fn();
const mockPatchSettings = vi.fn();
const mockAuthStatus = { value: 'unauthenticated' as string };

vi.mock('@/lib/api-client', () => ({
  fetchSettings: (...args: unknown[]) => mockFetchSettings(...args),
  patchSettings: (...args: unknown[]) => mockPatchSettings(...args),
}));

vi.mock('@/hooks/use-auth-session', () => ({
  useAuthSession: () => ({
    status: mockAuthStatus.value,
    userId: mockAuthStatus.value === 'authenticated' ? 'user-1' : null,
  }),
}));

let testStore: ReturnType<typeof createSettingsStore>;

vi.mock('@/lib/settings-store', async () => {
  const actual = await vi.importActual<typeof import('@/lib/settings-store')>(
    '@/lib/settings-store',
  );
  return {
    ...actual,
    getSettingsStore: () => testStore,
  };
});

import { useSettingsSync } from './use-settings-query';
import { getSettingsStore } from '@/lib/settings-store';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useSettingsSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    testStore = createSettingsStore();
    mockAuthStatus.value = 'unauthenticated';
    mockFetchSettings.mockResolvedValue(null);
    mockPatchSettings.mockResolvedValue({});
  });

  it('does not fetch settings when unauthenticated', async () => {
    mockAuthStatus.value = 'unauthenticated';
    renderHook(() => useSettingsSync(), { wrapper: createWrapper() });

    // Give React Query a tick to potentially fire
    await act(() => new Promise((r) => setTimeout(r, 50)));
    expect(mockFetchSettings).not.toHaveBeenCalled();
    expect(mockPatchSettings).not.toHaveBeenCalled();
  });

  it('fetches and syncs server settings when authenticated', async () => {
    mockAuthStatus.value = 'authenticated';
    const serverSettings = {
      keybindings: 'vim' as const,
      darkMode: false,
    };
    mockFetchSettings.mockResolvedValue(serverSettings);

    renderHook(() => useSettingsSync(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mockFetchSettings).toHaveBeenCalled();
    });

    await waitFor(() => {
      const state = getSettingsStore().getState();
      expect(state.settings.keybindings).toBe('vim');
      expect(state.settings.darkMode).toBe(false);
    });
  });

  it('pushes settings to server after debounce when authenticated', async () => {
    mockAuthStatus.value = 'authenticated';
    mockFetchSettings.mockResolvedValue({ keybindings: 'default', darkMode: true });

    renderHook(() => useSettingsSync(), { wrapper: createWrapper() });

    // Wait for initial sync
    await waitFor(() => {
      expect(getSettingsStore().getState().settings.keybindings).toBe('default');
    });

    // The initial sync triggers the debounce effect. After the debounce timer
    // fires, patchSettings should be called with the synced settings.
    await waitFor(
      () => {
        expect(mockPatchSettings).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );

    // Verify the push was called with current settings
    const call = mockPatchSettings.mock.calls[0][0] as Record<string, unknown>;
    expect(call).toHaveProperty('feedback');
    expect(call).toHaveProperty('keybindings');
    expect(call).toHaveProperty('darkMode');
    expect(call).toHaveProperty('formatter');
  }, 10000);

  it('warns on failed save but does not revert local store', async () => {
    mockAuthStatus.value = 'authenticated';
    mockFetchSettings.mockResolvedValue({ keybindings: 'default' });
    mockPatchSettings.mockRejectedValue(new Error('Network error'));
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { /* noop */ });

    renderHook(() => useSettingsSync(), { wrapper: createWrapper() });

    await waitFor(() => expect(mockFetchSettings).toHaveBeenCalled());

    act(() => {
      getSettingsStore().getState().setDarkMode(false);
    });

    await waitFor(
      () => {
        expect(warnSpy).toHaveBeenCalledWith('Failed to sync settings to server');
      },
      { timeout: 3000 },
    );

    // Local store should still have the changed value
    expect(getSettingsStore().getState().settings.darkMode).toBe(false);

    warnSpy.mockRestore();
  });

  it('resets sync flag on logout so next login re-syncs', async () => {
    mockAuthStatus.value = 'authenticated';
    mockFetchSettings.mockResolvedValue({ keybindings: 'vim' as const });

    const { rerender } = renderHook(() => useSettingsSync(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(mockFetchSettings).toHaveBeenCalledTimes(1));

    // Simulate logout
    mockAuthStatus.value = 'unauthenticated';
    rerender();

    await act(() => new Promise((r) => setTimeout(r, 50)));

    // Simulate re-login
    mockAuthStatus.value = 'authenticated';
    mockFetchSettings.mockResolvedValue({ keybindings: 'emacs' as const });
    rerender();

    await waitFor(() => {
      expect(mockFetchSettings).toHaveBeenCalledTimes(2);
    });
  });
});
