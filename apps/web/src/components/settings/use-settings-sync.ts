'use client';

import { useEffect, useRef } from 'react';
import { useStore } from 'zustand';
import { getSettingsStore } from '@/lib/settings-store';

/**
 * Hook that syncs settings between the local Zustand store and Convex.
 * When Convex is not configured, settings persist to localStorage only.
 *
 * Usage: call once in a layout or provider component.
 */
export function useSettingsSync() {
  const store = getSettingsStore();
  const settings = useStore(store, (s) => s.settings);
  const loaded = useStore(store, (s) => s.loaded);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Hydrate from localStorage on mount
  useEffect(() => {
    store.getState().hydrate();
  }, [store]);

  // Debounced sync to Convex when settings change
  // Currently a no-op since Convex may not be deployed
  useEffect(() => {
    if (!loaded) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      // When Convex is deployed, this would call:
      // mutation(api.settings.update, { ... })
    }, 1000);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [settings, loaded]);
}
