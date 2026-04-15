'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { backfillAttempts } from '@/lib/api-client';
import { clearAnonAttemptsLog, readAnonAttemptsLog } from '@/lib/anonymous-attempt-status';
import { useAuthSession } from '@/hooks/use-auth-session';

const FLAG_KEY = 'nthtime:backfilled';

/**
 * One-shot backfill on the first signed-in visit. Reads the anonymous
 * attempts log from localStorage and POSTs it to Spring Boot as historical
 * {@code Attempt} rows. On success we set {@code nthtime:backfilled} to
 * avoid ever running again, clear the source log, and invalidate the
 * `['streak']` TanStack query so the dashboard rerenders against the new
 * server snapshot.
 */
export function useBackfillOnSignin(): void {
  const { status } = useAuthSession();
  const queryClient = useQueryClient();
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    if (status !== 'authenticated') return;
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(FLAG_KEY)) return;

    const log = readAnonAttemptsLog();
    if (log.length === 0) {
      // Still mark as backfilled so we don't re-scan on every render cycle
      // for a user who never touched the product anonymously.
      try {
        localStorage.setItem(FLAG_KEY, '1');
      } catch {
        // ignore
      }
      return;
    }

    ranRef.current = true;
    backfillAttempts(log)
      .then(() => {
        try {
          localStorage.setItem(FLAG_KEY, '1');
        } catch {
          // ignore
        }
        clearAnonAttemptsLog();
        queryClient.invalidateQueries({ queryKey: ['streak'] });
      })
      .catch((err) => {
        // Reset so a transient failure doesn't permanently prevent retry.
        ranRef.current = false;
        console.warn('Anonymous backfill failed:', err);
      });
  }, [status, queryClient]);
}
