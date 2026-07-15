'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchSession } from '@/lib/api-client';
import { isFeatureEnabled } from '@/lib/feature-flags';

export function useAuthSession() {
  const authEnabled = isFeatureEnabled('auth');

  const { data, isLoading } = useQuery({
    queryKey: ['auth-session'],
    queryFn: fetchSession,
    staleTime: 60_000,
    retry: false,
    enabled: authEnabled,
  });

  // Checked before `isLoading`: a disabled query reports isLoading: true indefinitely,
  // which would otherwise pin every consumer at 'loading'.
  if (!authEnabled) {
    return { status: 'unauthenticated' as const, userId: null };
  }

  return {
    status: isLoading
      ? ('loading' as const)
      : data?.authenticated
      ? ('authenticated' as const)
      : ('unauthenticated' as const),
    userId: data?.userId ?? null,
  };
}
