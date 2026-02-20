import type { FileEntry } from './pack.js';
import type { AssertionSet } from './assertion.js';
import type { Difficulty } from './settings.js';

export interface Challenge {
  readonly id: string;
  readonly title: string;
  readonly prompt: string;
  readonly difficulty: Difficulty;
  readonly tags: readonly string[];
  readonly timeEstimateSeconds: number;
  readonly scaffolded: boolean;
  readonly files: readonly FileEntry[];
  readonly hints: readonly string[];
  readonly assertions: AssertionSet;
}
