'use client';

import { ConvexReactClient } from 'convex/react';
import { ConvexAuthProvider } from '@convex-dev/auth/react';
import { type ReactNode, useMemo } from 'react';

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const client = useMemo(
    () => (CONVEX_URL ? new ConvexReactClient(CONVEX_URL) : null),
    [],
  );

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
