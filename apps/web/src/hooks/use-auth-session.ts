'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchSession } from '@/lib/api-client';

export function useAuthSession() {
  const { data, isLoading } = useQuery({
    queryKey: ['auth-session'],
    queryFn: fetchSession,
    staleTime: 60_000,
    retry: false,
  });

  return {
    status: isLoading
      ? ('loading' as const)
      : data?.authenticated
        ? ('authenticated' as const)
        : ('unauthenticated' as const),
    userId: data?.userId ?? null,
  };
}
