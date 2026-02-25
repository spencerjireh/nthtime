import { resolve } from 'node:path';
import { getChallengeDir } from '../scaffold.js';

export interface ResolveDirOptions {
  readonly explicitDir?: string;
  readonly workspace?: string | null;
  readonly cwd: string;
}

export function resolveStartDir(
  packSlug: string,
  challengeSlug: string,
  options: ResolveDirOptions,
): string {
  if (options.explicitDir) {
    return resolve(options.explicitDir);
  }

  if (options.workspace) {
    return getChallengeDir(options.workspace, packSlug, challengeSlug);
  }

  return resolve(options.cwd, packSlug, challengeSlug);
}
