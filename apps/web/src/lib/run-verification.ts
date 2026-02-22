import type { AssertionSet, FileEntry, VerificationResult } from '@nthtime/shared';

export async function runVerification(
  assertions: AssertionSet,
  files: readonly FileEntry[],
): Promise<VerificationResult> {
  const { verify } = await import('@nthtime/verification');
  return verify(assertions, files, { wasmBasePath: '/tree-sitter/' });
}
