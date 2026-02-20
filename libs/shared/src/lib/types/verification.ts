import type { Assertion } from './assertion.js';

export interface SourceLocation {
  readonly file: string;
  readonly line: number;
  readonly column: number;
  readonly endLine?: number;
  readonly endColumn?: number;
}

export interface AssertionResult {
  readonly assertion: Assertion;
  readonly passed: boolean;
  readonly message: string;
  readonly location?: SourceLocation;
}

export interface FileVerificationResult {
  readonly file: string;
  readonly results: readonly AssertionResult[];
  readonly passed: boolean;
}

export interface VerificationResult {
  readonly passed: boolean;
  readonly fileResults: readonly FileVerificationResult[];
  readonly crossFileResults: readonly AssertionResult[];
  readonly totalAssertions: number;
  readonly passedAssertions: number;
}
