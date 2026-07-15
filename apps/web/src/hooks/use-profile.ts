'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchProfile, type Profile } from '@/lib/api-client';
import { useAuthSession } from '@/hooks/use-auth-session';

export function useProfile(): { profile: Profile | null; isLoading: boolean } {
  const { status } = useAuthSession();

  const { data, isLoading } = useQuery({
    queryKey: ['me', 'profile'],
    queryFn: fetchProfile,
    enabled: status === 'authenticated',
    staleTime: 5 * 60_000,
  });

  if (status !== 'authenticated') return { profile: null, isLoading: false };
  return { profile: data ?? null, isLoading };
}
