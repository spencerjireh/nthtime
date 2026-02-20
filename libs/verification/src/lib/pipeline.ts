import type {
  AssertionSet,
  FileEntry,
  VerificationResult,
  FileVerificationResult,
  AssertionResult,
} from '@nthtime/shared';
import { parseFiles } from './parser.js';
import { evaluateAssertion } from './evaluators/index.js';
import { evaluateCrossFileAssertions } from './cross-file.js';

export interface VerifyOptions {
  wasmBasePath?: string;
}

export async function verify(
  assertions: AssertionSet,
  files: readonly FileEntry[],
  options?: VerifyOptions,
): Promise<VerificationResult> {
  // 1. Parse all files
  const parsedFiles = await parseFiles(files, options?.wasmBasePath);

  // 2. Evaluate per-file assertions
  const fileResults: FileVerificationResult[] = [];

  for (const [filePath, fileAssertions] of Object.entries(assertions.perFile)) {
    const parsed = parsedFiles.find((pf) => pf.path === filePath);

    if (!parsed) {
      // File not found or unparseable -- all assertions fail
      const results: AssertionResult[] = fileAssertions.map((assertion) => ({
        assertion,
        passed: false,
        message: `File '${filePath}' could not be parsed or was not found`,
        location: { file: filePath, line: 0, column: 0 },
      }));

      fileResults.push({
        file: filePath,
        results,
        passed: false,
      });
      continue;
    }

    const results: AssertionResult[] = fileAssertions.map((assertion) =>
      evaluateAssertion(
        parsed.tree,
        parsed.content,
        assertion,
        parsed.path,
        parsed.tree.getLanguage(),
      ),
    );

    fileResults.push({
      file: filePath,
      results,
      passed: results.every((r) => r.passed),
    });
  }

  // 3. Evaluate cross-file assertions
  const crossFileResults = evaluateCrossFileAssertions(
    assertions.crossFile,
    parsedFiles,
  );

  // 4. Aggregate
  const allResults = [
    ...fileResults.flatMap((fr) => fr.results),
    ...crossFileResults,
  ];
  const totalAssertions = allResults.length;
  const passedAssertions = allResults.filter((r) => r.passed).length;

  return {
    passed: totalAssertions > 0 && passedAssertions === totalAssertions,
    fileResults,
    crossFileResults,
    totalAssertions,
    passedAssertions,
  };
}
