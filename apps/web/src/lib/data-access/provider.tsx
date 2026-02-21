'use client';

import { createContext, useContext, useMemo } from 'react';
import { mockHooks } from './mock-hooks';
import type { DataAccessHooks } from './types';

const DataAccessContext = createContext<DataAccessHooks>(mockHooks);

export function DataAccessProvider({ children }: { children: React.ReactNode }) {
  const hooks = useMemo(() => {
    // Use Convex hooks when URL is configured, mock hooks otherwise
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_CONVEX_URL) {
      // Dynamic import to avoid bundling convex/react when not needed
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
