'use client';

import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createAttempt, fetchAttempts } from '@/lib/api-client';
import { useAuthSession } from '@/hooks/use-auth-session';

export function useCreateAttempt() {
  const { status } = useAuthSession();
  const queryClient = useQueryClient();

  const { mutateAsync } = useMutation({
    mutationFn: createAttempt,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['attempts', variables.challengeId],
      });
      // Also refresh pack lists (passedCount might have changed)
      queryClient.invalidateQueries({ queryKey: ['packs'] });
      queryClient.invalidateQueries({ queryKey: ['pack-challenges'] });
    },
  });

  return useCallback(
    async (args: {
      challengeId: string;
      passed: boolean;
      assertionResults: unknown;
      hintsUsed: number;
    }) => {
      if (status !== 'authenticated') return;
      try {
        await mutateAsync(args);
      } catch {
        console.warn('Failed to persist attempt');
      }
    },
    [status, mutateAsync],
  );
}

export function useAttemptList(challengeId: string) {
  const { status } = useAuthSession();
  return useQuery({
    queryKey: ['attempts', challengeId],
    queryFn: () => fetchAttempts(challengeId),
    enabled: status === 'authenticated' && !!challengeId,
  });
}
