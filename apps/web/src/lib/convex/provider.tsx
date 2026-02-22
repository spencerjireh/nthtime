'use client';

import { ConvexReactClient } from 'convex/react';
import { ConvexAuthProvider } from '@convex-dev/auth/react';
import { type ReactNode, useMemo } from 'react';

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const client = useMemo(() => {
    if (!CONVEX_URL) return null;
    const c = new ConvexReactClient(CONVEX_URL);
    if (process.env.NEXT_PUBLIC_E2E_TEST_AUTH) {
      console.log('[E2E] Test auth mode enabled');
    }
    return c;
  }, []);

  if (!client) {
    // Convex not configured -- render children without provider for dev/build
    return <>{children}</>;
  }

  return (
    <ConvexAuthProvider client={client}>
      {children}
    </ConvexAuthProvider>
  );
}
