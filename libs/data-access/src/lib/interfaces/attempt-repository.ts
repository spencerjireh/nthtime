import type { AssertionResult } from '@nthtime/shared';

export interface CreateAttemptInput {
  readonly challengeId: string;
  readonly passed: boolean;
  readonly assertionResults: readonly AssertionResult[];
  readonly hintsUsed: number;
}

export interface AttemptRecord {
  readonly _id: string;
  readonly userId: string;
  readonly challengeId: string;
  readonly passed: boolean;
  readonly assertionResults: readonly AssertionResult[];
  readonly hintsUsed: number;
}

export interface AttemptRepository {
  createAttempt(userId: string, input: CreateAttemptInput): Promise<string>;
  listAttempts(userId: string, challengeId: string): Promise<readonly AttemptRecord[]>;
}
