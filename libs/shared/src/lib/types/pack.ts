import type { Challenge } from './challenge.js';

export interface FileEntry {
  readonly path: string;
  readonly content: string;
}

export interface Pack {
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly language: string;
  readonly framework?: string;
  readonly version: string;
  readonly author: string;
  readonly tags: readonly string[];
  readonly prerequisites?: readonly string[];
  readonly challenges: readonly Challenge[];
}
