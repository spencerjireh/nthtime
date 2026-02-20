import type { AssertionSet, FileEntry, VerificationResult } from '@nthtime/shared';

export async function runVerification(
  assertions: AssertionSet,
  _files: readonly FileEntry[],
): Promise<VerificationResult> {
  // Stub: returns all-fail results until Phase 7 wires the real verification engine
  const allAssertions = [
    ...Object.entries(assertions.perFile).flatMap(([file, fileAssertions]) =>
      fileAssertions.map((assertion) => ({
        assertion,
        passed: false,
        message: 'Verification engine not yet connected',
        location: { file, line: 0, column: 0 },
      })),
    ),
  ];

  const fileResults = Object.entries(assertions.perFile).map(
    ([file, fileAssertions]) => ({
      file,
      results: fileAssertions.map((assertion) => ({
        assertion,
        passed: false,
        message: 'Verification engine not yet connected',
        location: { file, line: 0, column: 0 },
      })),
      passed: false,
    }),
  );

  const crossFileResults = assertions.crossFile.map((assertion) => ({
    assertion,
    passed: false,
    message: 'Verification engine not yet connected',
    location: { file: '', line: 0, column: 0 },
  }));

  return {
    passed: false,
    fileResults,
    crossFileResults,
    totalAssertions: allAssertions.length + crossFileResults.length,
    passedAssertions: 0,
  };
}
