import type { AssertionResult } from './verification.js';

export interface Attempt {
  readonly userId: string;
  readonly challengeId: string;
  readonly passed: boolean;
  readonly assertionResults: readonly AssertionResult[];
  readonly hintsUsed: number;
  readonly timeSeconds: number;
  readonly timestamp: number;
}
