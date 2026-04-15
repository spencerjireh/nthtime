import type { Challenge } from '@nthtime/shared';

export interface PackSummary {
  readonly _id: string;
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly language: string;
  readonly framework?: string;
  readonly version: string;
  readonly author: string;
  readonly tags: readonly string[];
  readonly prerequisites?: readonly string[];
  readonly challengeCount: number;
  readonly passedCount: number;
}

export interface ChallengeSummary {
  readonly _id: string;
  readonly slug: string;
  readonly packSlug: string;
  readonly title: string;
  readonly difficulty: 'beginner' | 'intermediate' | 'advanced';
  readonly tags: readonly string[];
  readonly timeEstimateSeconds: number;
  readonly order: number;
  readonly status: 'not-attempted' | 'failed' | 'passed';
}

export interface PackDetail {
  readonly _id: string;
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly language: string;
  readonly framework?: string;
  readonly tags: readonly string[];
  readonly prerequisites?: readonly string[];
}

export interface PackListFilters {
  readonly language?: string;
  readonly difficulty?: string;
  readonly tags?: string[];
}

export interface PackListResult {
  readonly packs: readonly PackSummary[];
  readonly availableTags: readonly string[];
}

export interface PackChallengesResult {
  readonly pack: PackDetail;
  readonly challenges: readonly ChallengeSummary[];
}

export interface SearchResult {
  readonly _id: string;
  readonly packId: string;
  readonly slug: string;
  readonly title: string;
  readonly difficulty: string;
  readonly tags: readonly string[];
  readonly timeEstimateSeconds: number;
  readonly order: number;
}

export interface PackRepository {
  listPacks(filters: PackListFilters, userId?: string): Promise<PackListResult>;
  getChallenges(slug: string, userId?: string): Promise<PackChallengesResult | null>;
  getChallenge(id: string): Promise<Challenge | null>;
  getChallengeByPackAndSlug(packSlug: string, challengeSlug: string): Promise<Challenge | null>;
  search(query: string): Promise<readonly SearchResult[]>;
}
