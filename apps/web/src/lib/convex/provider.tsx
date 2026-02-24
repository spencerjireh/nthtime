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
    return (
      <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
        <h1>Convex not configured</h1>
        <p>
          Set <code>NEXT_PUBLIC_CONVEX_URL</code> in <code>.env.local</code> to connect to Convex.
        </p>
        <p>
          Run <code>npx convex dev</code> to start a development backend, then copy the URL.
        </p>
      </div>
    );
  }

  return <ConvexAuthProvider client={client}>{children}</ConvexAuthProvider>;
}
