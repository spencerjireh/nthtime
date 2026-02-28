'use client';

import { useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useStore } from 'zustand';
import { getSettingsStore } from '@/lib/settings-store';
import { fetchSettings, patchSettings } from '@/lib/api-client';
import { useAuthSession } from '@/hooks/use-auth-session';

/**
 * Hook that syncs settings between the local Zustand store and the REST API.
 * When not authenticated, settings persist to localStorage only.
 *
 * Usage: call once in a layout or provider component.
 */
export function useSettingsSync() {
  const store = getSettingsStore();
  const settings = useStore(store, (s) => s.settings);
  const loaded = useStore(store, (s) => s.loaded);
  const { status } = useAuthSession();
  const isAuthenticated = status === 'authenticated';

  const initialSyncDone = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Fetch server settings when authenticated
  const { data: serverSettings } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
    enabled: isAuthenticated,
  });

  const { mutateAsync: updateSettings } = useMutation({
    mutationFn: patchSettings,
  });

  // Merge server settings into local store on first load
  useEffect(() => {
    if (!isAuthenticated || !serverSettings || initialSyncDone.current) return;
    initialSyncDone.current = true;
    store.getState().syncFromServer(serverSettings);
  }, [isAuthenticated, serverSettings, store]);

  // Reset sync flag on logout
  useEffect(() => {
    if (!isAuthenticated) {
      initialSyncDone.current = false;
    }
  }, [isAuthenticated]);

  // Debounced push to server when settings change
  useEffect(() => {
    if (!loaded || !isAuthenticated || !initialSyncDone.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateSettings({
        feedback: settings.feedback,
        keybindings: settings.keybindings,
        darkMode: settings.darkMode,
        formatter: settings.formatter,
      }).catch(() => {
        console.warn('Failed to sync settings to server');
      });
    }, 1000);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [settings, loaded, isAuthenticated, updateSettings]);
}
