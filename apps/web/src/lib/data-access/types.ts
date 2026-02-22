import type { MockPack, MockChallenge } from '@/lib/mock-packs';
import type { Challenge, VerificationResult } from '@nthtime/shared';
import type { CompletionStatus } from '@/components/catalog/catalog-filters';

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
    packs: MockPack[];
    isLoading: boolean;
  };
  useChallenges: (slug: string) => {
    pack: { name: string; slug: string; description: string; language: string; tags: string[] } | null;
    challenges: MockChallenge[];
    isLoading: boolean;
  };
  useChallenge: (id: string) => {
    challenge: Challenge | null;
    isLoading: boolean;
  };
  useCreateAttempt: () => (args: CreateAttemptArgs) => Promise<void>;
}
