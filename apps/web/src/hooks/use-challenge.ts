'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchChallenge } from '@/lib/api-client';

export function useChallenge(id: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['challenge', id],
    queryFn: () => fetchChallenge(id),
    enabled: !!id,
  });

  if (isLoading) return { challenge: null, isLoading: true };
  return { challenge: data ?? null, isLoading: false };
}
