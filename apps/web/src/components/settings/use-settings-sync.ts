'use client';

import { useEffect, useRef } from 'react';
import { useConvexAuth, useMutation, useQuery } from 'convex/react';
import { useStore } from 'zustand';
import { getSettingsStore } from '@/lib/settings-store';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _api: any;
function getApi() {
  if (!_api) {
    _api = require('../../../../../convex/_generated/api').api;
  }
  return _api;
}

/**
 * Hook that syncs settings between the local Zustand store and Convex.
 * When not authenticated, settings persist to localStorage only.
 *
 * Usage: call once in a layout or provider component.
 */
export function useSettingsSync() {
  const store = getSettingsStore();
  const settings = useStore(store, (s) => s.settings);
  const loaded = useStore(store, (s) => s.loaded);
  const { isAuthenticated } = useConvexAuth();

  const initialSyncDone = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Fetch server settings when authenticated
  const serverSettings = useQuery(getApi().settings.get, isAuthenticated ? {} : 'skip') as
    | Record<string, unknown>
    | undefined;
  const updateSettings = useMutation(getApi().settings.update);

  // Merge server settings into local store on first load
  useEffect(() => {
    if (!isAuthenticated || !serverSettings || initialSyncDone.current) return;
    initialSyncDone.current = true;
    store.getState().syncFromServer(serverSettings);
  }, [isAuthenticated, serverSettings, store]);

  // Reset sync flag on logout so re-login re-fetches
  useEffect(() => {
    if (!isAuthenticated) {
      initialSyncDone.current = false;
    }
  }, [isAuthenticated]);

  // Debounced push to server when settings change (only after initial sync)
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
        // Fire-and-forget: don't break UI if sync fails
        console.warn('Failed to sync settings to server');
      });
    }, 1000);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [settings, loaded, isAuthenticated, updateSettings]);
}
