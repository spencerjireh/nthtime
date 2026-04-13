'use client';

import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';

// 100ms debounce before firing the prefetch — eliminates work on accidental
// hovers while still leaving ~100ms of head start before the user's click.
// prefetchQuery is a no-op when cached data is already fresh, so skimming
// many cards does not re-hit the API once staleTime is warm.
const HOVER_DEBOUNCE_MS = 100;

export function usePrefetchOnHover<T>(
  queryKey: QueryKey,
  queryFn: () => Promise<T>,
) {
  const queryClient = useQueryClient();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setTimeout(() => {
      queryClient.prefetchQuery({ queryKey, queryFn });
      timerRef.current = null;
    }, HOVER_DEBOUNCE_MS);
  }, [queryClient, queryKey, queryFn]);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return {
    onMouseEnter: start,
    onFocus: start,
    onMouseLeave: cancel,
    onBlur: cancel,
  };
}
