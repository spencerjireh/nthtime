import type { AssertionSet, FileEntry, VerificationResult } from '@nthtime/shared';
import { verify } from '@nthtime/verification';

export async function runVerification(
  assertions: AssertionSet,
  files: readonly FileEntry[],
): Promise<VerificationResult> {
  return verify(assertions, files, { wasmBasePath: '/tree-sitter/' });
}
