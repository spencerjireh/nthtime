'use client';

import { createContext, useContext } from 'react';
import { useStore } from 'zustand';
import type { EditorStore } from '@nthtime/editor';
import type { StoreApi } from 'zustand/vanilla';

export const EditorStoreContext = createContext<StoreApi<EditorStore> | null>(
  null,
);

export function useEditorStore<T>(selector: (state: EditorStore) => T): T {
  const store = useContext(EditorStoreContext);
  if (!store) {
    throw new Error('useEditorStore must be used within EditorStoreContext');
  }
  return useStore(store, selector);
}
