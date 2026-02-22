'use client';

import { createContext, useContext, useMemo } from 'react';
import { mockHooks } from './mock-hooks';
import type { DataAccessHooks } from './types';

const DataAccessContext = createContext<DataAccessHooks>(mockHooks);

export function DataAccessProvider({ children }: { children: React.ReactNode }) {
  const hooks = useMemo(() => {
    // Use Convex hooks when URL is configured, mock hooks otherwise.
    // NEXT_PUBLIC_ env vars are inlined at build time, so this is the same
    // value on both server and client -- avoiding hydration mismatches.
    if (process.env.NEXT_PUBLIC_CONVEX_URL) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { convexHooks } = require('./convex-hooks');
      return convexHooks as DataAccessHooks;
    }
    return mockHooks;
  }, []);

  return (
    <DataAccessContext value={hooks}>
      {children}
    </DataAccessContext>
  );
}

export function useDataAccess(): DataAccessHooks {
  return useContext(DataAccessContext);
}
