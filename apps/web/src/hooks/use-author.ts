'use client';

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  CreatePackInput,
  UpdatePackInput,
  CreateChallengeInput,
  UpdateChallengeInput,
  CreateTrackInput,
  UpdateTrackInput,
} from '@nthtime/data-access';
import {
  fetchAuthorPacks,
  fetchAuthorPack,
  fetchAuthorPackExport,
  checkSlugAvailable,
  createAuthorPack,
  updateAuthorPack,
  deleteAuthorPack,
  fetchAuthorChallenge,
  createAuthorChallenge,
  updateAuthorChallenge,
  deleteAuthorChallenge,
  reorderAuthorChallenges,
  fetchAuthorTracks,
  fetchAuthorTrack,
  createAuthorTrack,
  updateAuthorTrack,
  deleteAuthorTrack,
  reorderTrackPacks,
} from '@/lib/api-client';

type UpdatePackBody = Omit<UpdatePackInput, 'packId'>;
type UpdateTrackBody = Omit<UpdateTrackInput, 'trackId'>;
type CreateChallengeBody = Omit<CreateChallengeInput, 'packId'>;
type UpdateChallengeBody = Omit<UpdateChallengeInput, 'challengeId'>;

// -- Pack queries --

export function useMyPacks() {
  const { data, isLoading } = useQuery({
    queryKey: ['author-packs'],
    queryFn: fetchAuthorPacks,
  });
  return { packs: data ?? [], isLoading };
}

export function useAuthorPack(slug: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['author-pack', slug],
    queryFn: () => fetchAuthorPack(slug),
    enabled: !!slug,
  });
  if (isLoading || data === undefined) return { pack: null, isLoading: true };
  return { pack: data, isLoading: false };
}

export function useAuthorPackForExport(slug: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['author-pack-export', slug],
    queryFn: () => fetchAuthorPackExport(slug),
    enabled: !!slug,
  });
  if (isLoading || data === undefined) return { packData: null, isLoading: true };
  return { packData: data, isLoading: false };
}

export function useCheckSlugAvailable(slug: string, excludePackId?: string) {
  const { data } = useQuery({
    queryKey: ['check-slug', slug, excludePackId],
    queryFn: () => checkSlugAvailable(slug, excludePackId),
    enabled: !!slug,
  });
  return data?.available;
}

// -- Pack mutations --

export function useCreatePack() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: (args: CreatePackInput) => createAuthorPack(args),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['author-packs'] });
    },
  });
  return useCallback(
    async (args: CreatePackInput) => {
      const result = await mutateAsync(args);
      return result.id;
    },
    [mutateAsync],
  );
}

export function useUpdatePack() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: ({ slug, body }: { slug: string; body: UpdatePackBody }) =>
      updateAuthorPack(slug, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['author-packs'] });
      queryClient.invalidateQueries({ queryKey: ['author-pack'] });
    },
  });
  return useCallback(
    async (slug: string, body: UpdatePackBody) => {
      await mutateAsync({ slug, body });
    },
    [mutateAsync],
  );
}

export function useDeletePack() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: deleteAuthorPack,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['author-packs'] });
    },
  });
  return mutateAsync;
}

// -- Challenge queries --

export function useAuthorChallenge(challengeId: string | null) {
  const { data, isLoading } = useQuery({
    queryKey: ['author-challenge', challengeId],
    queryFn: () => {
      if (!challengeId) throw new Error('challengeId is required');
      return fetchAuthorChallenge(challengeId);
    },
    enabled: !!challengeId,
  });
  if (isLoading || data === undefined) return { challenge: null, isLoading: true };
  return { challenge: data, isLoading: false };
}

// -- Challenge mutations --

export function useCreateChallenge() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: ({ packSlug, ...body }: { packSlug: string } & CreateChallengeBody) =>
      createAuthorChallenge(packSlug, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['author-pack'] });
      queryClient.invalidateQueries({ queryKey: ['author-packs'] });
    },
  });
  return useCallback(
    async (args: { packSlug: string } & CreateChallengeBody) => {
      const result = await mutateAsync(args);
      return result.id;
    },
    [mutateAsync],
  );
}

export function useUpdateChallenge() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: ({ challengeId, ...body }: { challengeId: string } & UpdateChallengeBody) =>
      updateAuthorChallenge(challengeId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['author-pack'] });
      queryClient.invalidateQueries({ queryKey: ['author-challenge'] });
    },
  });
  return mutateAsync;
}

export function useDeleteChallenge() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: deleteAuthorChallenge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['author-pack'] });
      queryClient.invalidateQueries({ queryKey: ['author-packs'] });
    },
  });
  return mutateAsync;
}

export function useReorderChallenges() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: ({
      packSlug,
      challengeIds,
    }: {
      packSlug: string;
      challengeIds: string[];
    }) => reorderAuthorChallenges(packSlug, challengeIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['author-pack'] });
    },
  });
  return useCallback(
    async (packSlug: string, challengeIds: string[]) => {
      await mutateAsync({ packSlug, challengeIds });
    },
    [mutateAsync],
  );
}

// -- Track queries --

export function useMyTracks() {
  const { data, isLoading } = useQuery({
    queryKey: ['author-tracks'],
    queryFn: fetchAuthorTracks,
  });
  return { tracks: data ?? [], isLoading };
}

export function useAuthorTrack(slug: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['author-track', slug],
    queryFn: () => fetchAuthorTrack(slug),
    enabled: !!slug,
  });
  if (isLoading || data === undefined) return { track: null, isLoading: true };
  return { track: data, isLoading: false };
}

// -- Track mutations --

export function useCreateTrack() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: (args: CreateTrackInput) => createAuthorTrack(args),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['author-tracks'] });
    },
  });
  return useCallback(
    async (args: CreateTrackInput) => {
      const result = await mutateAsync(args);
      return result.id;
    },
    [mutateAsync],
  );
}

export function useUpdateTrack() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: ({ slug, body }: { slug: string; body: UpdateTrackBody }) =>
      updateAuthorTrack(slug, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['author-tracks'] });
      queryClient.invalidateQueries({ queryKey: ['author-track'] });
    },
  });
  return useCallback(
    async (slug: string, body: UpdateTrackBody) => {
      await mutateAsync({ slug, body });
    },
    [mutateAsync],
  );
}

export function useDeleteTrack() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: deleteAuthorTrack,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['author-tracks'] });
    },
  });
  return mutateAsync;
}

export function useReorderTrackPacks() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: ({ slug, packSlugs }: { slug: string; packSlugs: string[] }) =>
      reorderTrackPacks(slug, packSlugs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['author-track'] });
    },
  });
  return useCallback(
    async (slug: string, packSlugs: string[]) => {
      await mutateAsync({ slug, packSlugs });
    },
    [mutateAsync],
  );
}
