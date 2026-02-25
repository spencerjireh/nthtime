import type { VerificationResult } from '@nthtime/shared';

export interface FormattedLine {
  readonly mark: string;
  readonly description: string;
  readonly passed: boolean;
}

export function formatResultLines(result: VerificationResult): FormattedLine[] {
  const allResults = [
    ...result.fileResults.flatMap((fr) => fr.results),
    ...result.crossFileResults,
  ];

  return allResults.map((r) => ({
    mark: r.passed ? '*' : 'x',
    description: r.assertion.description,
    passed: r.passed,
  }));
}

export function formatResultSummary(result: VerificationResult): string {
  const lines = formatResultLines(result);
  const parts: string[] = [];

  for (const line of lines) {
    parts.push(`  ${line.mark} ${line.description}`);
  }

  parts.push('');
  parts.push(`${result.passedAssertions}/${result.totalAssertions} passing`);

  if (result.passed) {
    parts.push('');
    parts.push('All assertions passed!');
  }

  return parts.join('\n');
}
