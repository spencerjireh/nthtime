'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchTracks, fetchTrack } from '@/lib/api-client';

export function useTrackList() {
  const { data, isLoading } = useQuery({
    queryKey: ['tracks'],
    queryFn: fetchTracks,
  });
  return { tracks: data ?? [], isLoading };
}

export function useTrack(slug: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['track', slug],
    queryFn: () => fetchTrack(slug),
    enabled: !!slug,
  });
  if (isLoading || data === undefined) return { track: null, isLoading: true };
  return { track: data, isLoading: false };
}
