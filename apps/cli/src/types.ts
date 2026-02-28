import type { AssertionSet } from '@nthtime/shared';

export interface CliChallengeResponse {
  readonly title: string;
  readonly slug: string;
  readonly prompt: string;
  readonly difficulty: string;
  readonly expectedFiles: readonly string[];
  readonly assertions: AssertionSet;
  readonly hints: readonly string[];
  readonly webUrl: string;
}

export interface CliPackResponse {
  readonly name: string;
  readonly slug: string;
  readonly language: string;
  readonly framework?: string;
  readonly challenges: readonly {
    readonly title: string;
    readonly slug: string;
    readonly order: number;
    readonly difficulty: string;
  }[];
}

export interface NthtimeMetadata {
  readonly packSlug: string;
  readonly challengeSlug: string;
  readonly title: string;
  readonly prompt: string;
  readonly serverUrl: string;
  readonly assertions: AssertionSet;
  readonly hints: readonly string[];
  readonly expectedFiles: readonly string[];
  readonly webUrl: string;
}

export interface CliConfig {
  readonly serverUrl: string;
  readonly workspace: string;
  readonly fileStubs?: boolean;
}
