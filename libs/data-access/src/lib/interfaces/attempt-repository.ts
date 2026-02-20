import type { Attempt, AssertionResult } from '@nthtime/shared';

export interface CreateAttemptInput {
  readonly challengeId: string;
  readonly passed: boolean;
  readonly assertionResults: readonly AssertionResult[];
  readonly hintsUsed: number;
  readonly timeSeconds: number;
}

export interface AttemptRepository {
  createAttempt(input: CreateAttemptInput): Promise<Attempt>;
  listAttempts(challengeId: string): Promise<readonly Attempt[]>;
}
