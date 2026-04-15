'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { StreakSnapshot } from '@nthtime/shared';
import { fetchStreak } from '@/lib/api-client';
import { readAnonAttemptsLog, type AnonPassLogEntry } from '@/lib/anonymous-attempt-status';
import { computeStreakSnapshot } from '@/lib/streak';
import { useAuthSession } from '@/hooks/use-auth-session';

const HEATMAP_DAYS = 84;

/**
 * Unified streak source for the home dashboard. When the user is signed in,
 * returns the server-derived snapshot (TanStack Query, keyed on `['streak']`,
 * hydrated from the RSC pass via `initialData`). When anonymous, reads the
 * client-side `nthtime:anon-attempts-log` and derives locally.
 */
export function useStreak(serverSnapshot: StreakSnapshot | null): StreakSnapshot | null {
  const { status } = useAuthSession();
  const [anonLog, setAnonLog] = useState<AnonPassLogEntry[]>([]);

  // Seed from localStorage after mount (SSR-safe) and refresh when another
  // tab passes a challenge.
  useEffect(() => {
    if (status !== 'unauthenticated') return;
    setAnonLog(readAnonAttemptsLog());
    function onStorage(event: StorageEvent) {
      if (event.key === 'nthtime:anon-attempts-log' || event.key === null) {
        setAnonLog(readAnonAttemptsLog());
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [status]);

  const serverQuery = useQuery({
    queryKey: ['streak'],
    queryFn: fetchStreak,
    enabled: status === 'authenticated',
    initialData: serverSnapshot ?? undefined,
    staleTime: 60_000,
  });

  const anonSnapshot = useMemo(() => computeStreakSnapshot(anonLog, HEATMAP_DAYS), [anonLog]);

  if (status === 'loading') return serverSnapshot;
  if (status === 'authenticated') return serverQuery.data ?? serverSnapshot;
  return anonSnapshot;
}

export function useInvalidateStreak(): () => void {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['streak'] });
}
