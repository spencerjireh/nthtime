'use client';

import { useCallback } from 'react';
import { signOut } from '@/lib/api-client';

/**
 * Signs out via POST (the endpoint is CSRF-protected, so it cannot be a link or a
 * plain form submit -- the token travels in the X-XSRF-TOKEN header). Reloads to `/`
 * on completion, which clears the React Query cache and in-memory stores along with it.
 */
export function useSignOut(): () => Promise<void> {
  return useCallback(async () => {
    try {
      await signOut();
    } finally {
      window.location.assign('/');
    }
  }, []);
}
