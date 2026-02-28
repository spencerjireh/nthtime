import { ConvexHttpClient } from 'convex/browser';
import type {
  PackRepository,
  AttemptRepository,
  SettingsRepository,
  AuthorRepository,
  PackListFilters,
  CreateAttemptInput,
  CreatePackInput,
  UpdatePackInput,
  CreateChallengeInput,
  UpdateChallengeInput,
} from '@nthtime/data-access';
import type { Challenge, Difficulty, AssertionSet, UserSettings } from '@nthtime/shared';

const url = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!url) {
  throw new Error('NEXT_PUBLIC_CONVEX_URL is required');
}

const client = new ConvexHttpClient(url);

let _serviceToken: string | undefined;
function getServiceToken(): string {
  if (!_serviceToken) {
    _serviceToken = process.env.CONVEX_SERVICE_TOKEN;
    if (!_serviceToken) {
      throw new Error('CONVEX_SERVICE_TOKEN is required');
    }
  }
  return _serviceToken;
}

// Lazy-load Convex API to avoid TS6059 rootDir issues with generated types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _api: any;
function getApi() {
  if (!_api) {
    // eslint-disable-next-line @nx/enforce-module-boundaries
    _api = require('../../../../../convex/_generated/api').api;
  }
  return _api;
}

// ---------------------------------------------------------------------------
// PackRepository
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapChallenge(doc: any): Challenge {
  return {
    id: doc._id,
    slug: doc.slug,
    title: doc.title,
    prompt: doc.prompt,
    difficulty: doc.difficulty as Difficulty,
    tags: doc.tags,
    timeEstimateSeconds: doc.timeEstimateSeconds,
    scaffolded: doc.scaffolded,
    files: doc.files,
    hints: doc.hints,
    assertions: doc.assertions as AssertionSet,
    referenceSolution: doc.referenceSolution,
  };
}

export const packRepository: PackRepository = {
  async listPacks(filters: PackListFilters, userId?: string) {
    if (userId) {
      return client.query(getApi().service.listPacksAuth, {
        serviceToken: getServiceToken(),
        userId,
        language: filters.language,
        difficulty: filters.difficulty,
        tags: filters.tags,
      });
    }
    return client.query(getApi().packs.list, {
      language: filters.language,
      difficulty: filters.difficulty,
      tags: filters.tags,
    });
  },

  async getChallenges(slug: string, userId?: string) {
    if (userId) {
      return client.query(getApi().service.getChallengesAuth, {
        serviceToken: getServiceToken(),
        userId,
        slug,
      });
    }
    return client.query(getApi().packs.getChallenges, { slug });
  },

  async getChallenge(id: string) {
    const doc = await client.query(getApi().challenges.get, { id });
    if (!doc) return null;
    return mapChallenge(doc);
  },

  async getChallengeByPackAndSlug(packSlug: string, challengeSlug: string) {
    const doc = await client.query(getApi().challenges.getByPackAndSlug, {
      packSlug,
      challengeSlug,
    });
    if (!doc) return null;
    return mapChallenge(doc);
  },

  async search(query: string) {
    return client.query(getApi().packs.search, { query });
  },
};

// ---------------------------------------------------------------------------
// AttemptRepository
// ---------------------------------------------------------------------------

export const attemptRepository: AttemptRepository = {
  async createAttempt(userId: string, input: CreateAttemptInput) {
    const id = await client.mutation(getApi().service.createAttempt, {
      serviceToken: getServiceToken(),
      userId,
      challengeId: input.challengeId,
      passed: input.passed,
      assertionResults: input.assertionResults,
      hintsUsed: input.hintsUsed,
      timeSeconds: input.timeSeconds,
    });
    return id as string;
  },

  async listAttempts(userId: string, challengeId: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = await client.query(getApi().service.listAttempts, {
      serviceToken: getServiceToken(),
      userId,
      challengeId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any[];
    return results.map((a) => ({
      _id: a._id,
      userId: a.userId,
      challengeId: a.challengeId,
      passed: a.passed,
      assertionResults: a.assertionResults,
      hintsUsed: a.hintsUsed,
      timeSeconds: a.timeSeconds,
    }));
  },
};

// ---------------------------------------------------------------------------
// SettingsRepository
// ---------------------------------------------------------------------------

export const settingsRepository: SettingsRepository = {
  async getSettings(userId: string) {
    return client.query(getApi().service.getSettings, { serviceToken: getServiceToken(), userId });
  },

  async updateSettings(userId: string, partial: Partial<UserSettings>) {
    return client.mutation(getApi().service.updateSettings, {
      serviceToken: getServiceToken(),
      userId,
      feedback: partial.feedback,
      keybindings: partial.keybindings,
      darkMode: partial.darkMode,
      formatter: partial.formatter,
    });
  },
};

// ---------------------------------------------------------------------------
// AuthorRepository
// ---------------------------------------------------------------------------

export const authorRepository: AuthorRepository = {
  async myPacks(userId: string) {
    return client.query(getApi().service.authorMyPacks, { serviceToken: getServiceToken(), userId });
  },

  async getBySlug(userId: string, slug: string) {
    return client.query(getApi().service.authorGetBySlug, { serviceToken: getServiceToken(), userId, slug });
  },

  async getForExport(userId: string, slug: string) {
    return client.query(getApi().service.authorGetForExport, { serviceToken: getServiceToken(), userId, slug });
  },

  async checkSlugAvailable(slug: string, excludePackId?: string) {
    return client.query(getApi().service.authorCheckSlugAvailable, {
      serviceToken: getServiceToken(),
      slug,
      excludePackId,
    });
  },

  async createPack(userId: string, input: CreatePackInput) {
    const id = await client.mutation(getApi().service.authorCreatePack, {
      serviceToken: getServiceToken(),
      userId,
      ...input,
    });
    return id as string;
  },

  async updatePack(userId: string, input: UpdatePackInput) {
    const { packId, ...rest } = input;
    await client.mutation(getApi().service.authorUpdatePack, {
      serviceToken: getServiceToken(),
      userId,
      packId,
      ...rest,
    });
  },

  async removePack(userId: string, packId: string) {
    await client.mutation(getApi().service.authorRemovePack, {
      serviceToken: getServiceToken(),
      userId,
      packId,
    });
  },

  async getChallenge(userId: string, challengeId: string) {
    return client.query(getApi().service.authorGetChallenge, {
      serviceToken: getServiceToken(),
      userId,
      challengeId,
    });
  },

  async createChallenge(userId: string, input: CreateChallengeInput) {
    const id = await client.mutation(getApi().service.authorCreateChallenge, {
      serviceToken: getServiceToken(),
      userId,
      packId: input.packId,
      slug: input.slug,
      title: input.title,
      prompt: input.prompt,
      difficulty: input.difficulty,
      tags: input.tags,
      timeEstimateSeconds: input.timeEstimateSeconds,
      scaffolded: input.scaffolded,
      files: input.files as { path: string; content: string }[],
      hints: input.hints,
      assertions: input.assertions,
      referenceSolution: input.referenceSolution as { path: string; content: string }[] | undefined,
    });
    return id as string;
  },

  async updateChallenge(userId: string, input: UpdateChallengeInput) {
    const { challengeId, ...rest } = input;
    await client.mutation(getApi().service.authorUpdateChallenge, {
      serviceToken: getServiceToken(),
      userId,
      challengeId,
      ...rest,
      files: rest.files as { path: string; content: string }[] | undefined,
      referenceSolution: rest.referenceSolution as { path: string; content: string }[] | undefined,
    });
  },

  async removeChallenge(userId: string, challengeId: string) {
    await client.mutation(getApi().service.authorRemoveChallenge, {
      serviceToken: getServiceToken(),
      userId,
      challengeId,
    });
  },

  async reorderChallenges(userId: string, packId: string, challengeIds: string[]) {
    await client.mutation(getApi().service.authorReorderChallenges, {
      serviceToken: getServiceToken(),
      userId,
      packId,
      challengeIds,
    });
  },
};
