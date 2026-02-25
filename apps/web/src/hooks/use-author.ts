'use client';

import { useCallback } from 'react';
import { useMutation, useQuery } from 'convex/react';

// Same lazy-load pattern as convex-hooks.ts to avoid TS6059 rootDir issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _api: any;
function getApi() {
  if (!_api) {
    _api = require('../../../../convex/_generated/api').api;
  }
  return _api;
}

// -- Pack queries --

export function useMyPacks() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = useQuery(getApi().authorPacks.myPacks) as any[] | undefined;
  return { packs: data ?? [], isLoading: data === undefined };
}

export function useAuthorPack(slug: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = useQuery(getApi().authorPacks.getBySlug, { slug }) as any | undefined;
  if (data === undefined) return { pack: null, isLoading: true };
  return { pack: data, isLoading: false };
}

export function useAuthorPackForExport(slug: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = useQuery(getApi().authorPacks.getForExport, { slug }) as any | undefined;
  if (data === undefined) return { packData: null, isLoading: true };
  return { packData: data, isLoading: false };
}

export function useCheckSlugAvailable(slug: string, excludePackId?: string) {
  const args = { slug, excludePackId: excludePackId || undefined };
  const data = useQuery(getApi().authorPacks.checkSlugAvailable, slug ? args : 'skip') as
    | boolean
    | undefined;
  return data;
}

// -- Pack mutations --

export function useCreatePack() {
  const create = useMutation(getApi().authorPacks.create);
  return useCallback(
    async (args: {
      name: string;
      slug: string;
      description: string;
      language: string;
      framework?: string;
      version: string;
      tags: string[];
      visibility?: string;
    }) => {
      return await create(args);
    },
    [create],
  );
}

export function useUpdatePack() {
  const update = useMutation(getApi().authorPacks.update);
  return useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (args: { packId: any } & Record<string, unknown>) => {
      return await update(args);
    },
    [update],
  );
}

export function useDeletePack() {
  const remove = useMutation(getApi().authorPacks.remove);
  return useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (packId: any) => {
      return await remove({ packId });
    },
    [remove],
  );
}

// -- Challenge queries --

export function useAuthorChallenge(challengeId: string | null) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = useQuery(getApi().authorChallenges.get, challengeId ? { challengeId } : 'skip') as
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any | undefined;
  if (data === undefined) return { challenge: null, isLoading: true };
  return { challenge: data, isLoading: false };
}

// -- Challenge mutations --

export function useCreateChallenge() {
  const create = useMutation(getApi().authorChallenges.create);
  return useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (args: any) => {
      return await create(args);
    },
    [create],
  );
}

export function useUpdateChallenge() {
  const update = useMutation(getApi().authorChallenges.update);
  return useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (args: any) => {
      return await update(args);
    },
    [update],
  );
}

export function useDeleteChallenge() {
  const remove = useMutation(getApi().authorChallenges.remove);
  return useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (challengeId: any) => {
      return await remove({ challengeId });
    },
    [remove],
  );
}

export function useReorderChallenges() {
  const reorder = useMutation(getApi().authorChallenges.reorder);
  return useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (packId: any, challengeIds: any[]) => {
      return await reorder({ packId, challengeIds });
    },
    [reorder],
  );
}
