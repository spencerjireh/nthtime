import type { FileEntry } from '@nthtime/shared';

export interface AuthorPackSummary {
  readonly _id: string;
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly language: string;
  readonly framework?: string;
  readonly version: string;
  readonly tags: readonly string[];
  readonly visibility: string;
  readonly challengeCount: number;
  readonly createdAt?: number;
  readonly updatedAt?: number;
}

export interface AuthorChallengeSummary {
  readonly _id: string;
  readonly slug: string;
  readonly title: string;
  readonly difficulty: string;
  readonly tags: readonly string[];
  readonly timeEstimateSeconds: number;
  readonly order: number;
}

export interface AuthorPackDetail extends AuthorPackSummary {
  readonly challenges: readonly AuthorChallengeSummary[];
}

export interface AuthorChallengeDetail {
  readonly _id: string;
  readonly packId: string;
  readonly slug: string;
  readonly title: string;
  readonly prompt: string;
  readonly difficulty: string;
  readonly tags: readonly string[];
  readonly timeEstimateSeconds: number;
  readonly hints: readonly string[];
  readonly assertions: { perFile: unknown; crossFile: unknown };
  readonly referenceSolution: readonly FileEntry[];
  readonly order: number;
}

export interface AuthorPackExport {
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly language: string;
  readonly framework?: string;
  readonly version: string;
  readonly tags: readonly string[];
  readonly challenges: readonly {
    readonly title: string;
    readonly prompt: string;
    readonly difficulty: string;
    readonly tags: readonly string[];
    readonly timeEstimateSeconds: number;
    readonly hints: readonly string[];
    readonly assertions: { perFile: unknown; crossFile: unknown };
    readonly referenceSolution: readonly FileEntry[];
    readonly order: number;
  }[];
}

export interface CreatePackInput {
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly language: string;
  readonly framework?: string;
  readonly version: string;
  readonly tags: string[];
  readonly visibility?: string;
}

export interface UpdatePackInput {
  readonly packId: string;
  readonly name?: string;
  readonly slug?: string;
  readonly description?: string;
  readonly language?: string;
  readonly framework?: string;
  readonly version?: string;
  readonly tags?: string[];
  readonly visibility?: string;
}

export interface CreateChallengeInput {
  readonly packId: string;
  readonly slug: string;
  readonly title: string;
  readonly prompt: string;
  readonly difficulty: string;
  readonly tags: string[];
  readonly timeEstimateSeconds: number;
  readonly hints: string[];
  readonly assertions: { perFile: unknown; crossFile: unknown };
  readonly referenceSolution: FileEntry[];
}

export interface UpdateChallengeInput {
  readonly challengeId: string;
  readonly slug?: string;
  readonly title?: string;
  readonly prompt?: string;
  readonly difficulty?: string;
  readonly tags?: string[];
  readonly timeEstimateSeconds?: number;
  readonly hints?: string[];
  readonly assertions?: { perFile: unknown; crossFile: unknown };
  readonly referenceSolution?: FileEntry[];
}

export interface AuthorRepository {
  myPacks(userId: string): Promise<readonly AuthorPackSummary[]>;
  getBySlug(userId: string, slug: string): Promise<AuthorPackDetail | null>;
  getForExport(userId: string, slug: string): Promise<AuthorPackExport | null>;
  checkSlugAvailable(slug: string, excludePackId?: string): Promise<boolean>;
  createPack(userId: string, input: CreatePackInput): Promise<string>;
  updatePack(userId: string, input: UpdatePackInput): Promise<void>;
  removePack(userId: string, packId: string): Promise<void>;
  getChallenge(userId: string, challengeId: string): Promise<AuthorChallengeDetail | null>;
  createChallenge(userId: string, input: CreateChallengeInput): Promise<string>;
  updateChallenge(userId: string, input: UpdateChallengeInput): Promise<void>;
  removeChallenge(userId: string, challengeId: string): Promise<void>;
  reorderChallenges(userId: string, packId: string, challengeIds: string[]): Promise<void>;
}
