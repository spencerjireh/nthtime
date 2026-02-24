'use client';

import { createContext, useContext } from 'react';
import { convexHooks } from './convex-hooks';
import type { DataAccessHooks } from './types';

const DataAccessContext = createContext<DataAccessHooks>(convexHooks);

export function DataAccessProvider({ children }: { children: React.ReactNode }) {
  return <DataAccessContext value={convexHooks}>{children}</DataAccessContext>;
}

export function useDataAccess(): DataAccessHooks {
  return useContext(DataAccessContext);
}
