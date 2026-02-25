import type { Challenge, VerificationResult } from '@nthtime/shared';
import type { CompletionStatus } from '@/components/catalog/catalog-filters';

export interface PackSummary {
  _id: string;
  name: string;
  slug: string;
  description: string;
  language: string;
  framework?: string;
  version: string;
  author: string;
  tags: string[];
  challengeCount: number;
  passedCount: number;
}

export interface ChallengeSummary {
  _id: string;
  slug: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  timeEstimateSeconds: number;
  order: number;
  status: 'not-attempted' | 'failed' | 'passed';
}

export interface PackListFilters {
  language?: string;
  difficulty?: string;
  tags?: string[];
  status?: CompletionStatus;
  searchQuery?: string;
}

export interface CreateAttemptArgs {
  challengeId: string;
  passed: boolean;
  assertionResults: VerificationResult['fileResults'];
  hintsUsed: number;
  timeSeconds: number;
}

export interface DataAccessHooks {
  usePackList: (filters: PackListFilters) => {
    packs: PackSummary[];
    availableTags: string[];
    isLoading: boolean;
  };
  useChallenges: (slug: string) => {
    pack: { name: string; slug: string; description: string; language: string; tags: string[] } | null;
    challenges: ChallengeSummary[];
    isLoading: boolean;
  };
  useChallenge: (id: string) => {
    challenge: Challenge | null;
    isLoading: boolean;
  };
  useCreateAttempt: () => (args: CreateAttemptArgs) => Promise<void>;
}
