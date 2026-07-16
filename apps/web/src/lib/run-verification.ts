import type { AssertionSet, FileEntry, VerificationResult } from '@nthtime/shared';

const DEBUG_STORAGE_KEY = 'nthtime:debug-verify';

/**
 * Whether to log the client-side verification pipeline. Silent by default so production consoles
 * stay clean. Enable per-session in the browser with
 *   localStorage.setItem('nthtime:debug-verify', '1')
 * or build-wide with NEXT_PUBLIC_DEBUG_VERIFY=true (written as a literal member expression so
 * Next inlines it into the client bundle).
 */
function verifyDebugEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_DEBUG_VERIFY === 'true') return true;
  try {
    return typeof window !== 'undefined' && window.localStorage.getItem(DEBUG_STORAGE_KEY) !== null;
  } catch {
    // localStorage access can throw (private mode, disabled storage) -- treat as off.
    return false;
  }
}

/** Collect "file: description" for every failing assertion, per-file and cross-file. */
function failedAssertions(result: VerificationResult): string[] {
  const failed: string[] = [];
  for (const fileResult of result.fileResults) {
    for (const r of fileResult.results) {
      if (!r.passed) failed.push(`${fileResult.file}: ${r.assertion.description}`);
    }
  }
  for (const r of result.crossFileResults) {
    if (!r.passed) failed.push(`crossFile: ${r.assertion.description}`);
  }
  return failed;
}

export async function runVerification(
  assertions: AssertionSet,
  files: readonly FileEntry[],
): Promise<VerificationResult> {
  const { verify } = await import('@nthtime/verification');

  if (!verifyDebugEnabled()) {
    return verify(assertions, files, { wasmBasePath: '/tree-sitter/' });
  }

  const startedAt = performance.now();
  try {
    const result = await verify(assertions, files, { wasmBasePath: '/tree-sitter/' });
    console.debug('[nthtime:verify]', {
      passed: result.passed,
      assertions: `${result.passedAssertions}/${result.totalAssertions}`,
      durationMs: Math.round((performance.now() - startedAt) * 100) / 100,
      files: files.map((f) => f.path),
      failed: failedAssertions(result),
    });
    return result;
  } catch (error) {
    console.debug('[nthtime:verify] threw', {
      durationMs: Math.round((performance.now() - startedAt) * 100) / 100,
      files: files.map((f) => f.path),
      error,
    });
    throw error;
  }
}
