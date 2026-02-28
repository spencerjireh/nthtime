'use client';

import { SessionProvider } from 'next-auth/react';
import { QueryProvider } from './query-provider';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <QueryProvider>{children}</QueryProvider>
    </SessionProvider>
  );
}
