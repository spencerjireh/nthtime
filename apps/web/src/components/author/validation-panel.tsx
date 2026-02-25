'use client';

import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { runVerification } from '@/lib/run-verification';
import type { AssertionSet, VerificationResult, AssertionResult } from '@nthtime/shared';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, Play } from 'lucide-react';

interface ValidationPanelProps {
  assertionsJson: string;
  solutionFiles: { path: string; content: string }[];
}

export function ValidationPanel({ assertionsJson, solutionFiles }: ValidationPanelProps) {
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleValidate = useCallback(async () => {
    setError(null);
    setResult(null);

    let assertions: AssertionSet;
    try {
      assertions = JSON.parse(assertionsJson);
    } catch {
      setError('Invalid assertions JSON. Fix syntax errors first.');
      return;
    }

    if (solutionFiles.length === 0) {
      setError('No solution files. Add files in the Solution tab first.');
      return;
    }

    setIsRunning(true);
    try {
      const verificationResult = await runVerification(assertions, solutionFiles);
      setResult(verificationResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsRunning(false);
    }
  }, [assertionsJson, solutionFiles]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleValidate} disabled={isRunning}>
          <Play className="mr-1.5 h-3.5 w-3.5" />
          {isRunning ? 'Validating...' : 'Validate'}
        </Button>
        <span className="text-xs text-muted-foreground">
          Runs assertions against solution files
        </span>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-2">
          <div
            className={cn(
              'rounded-md px-3 py-2 text-sm font-medium',
              result.passed
                ? 'border border-pass/50 bg-pass/10 text-pass'
                : 'border border-fail/50 bg-fail/10 text-fail',
            )}
          >
            {result.passed ? 'All assertions passed' : 'Some assertions failed'} --{' '}
            {result.passedAssertions}/{result.totalAssertions} passed
          </div>

          {result.fileResults.map((fileResult) => (
            <div key={fileResult.file} className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">
                {fileResult.file}
              </div>
              {fileResult.results.map((ar, i) => (
                <AssertionResultRow key={i} result={ar} />
              ))}
            </div>
          ))}

          {result.crossFileResults.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">Cross-file</div>
              {result.crossFileResults.map((ar, i) => (
                <AssertionResultRow key={i} result={ar} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AssertionResultRow({ result }: { result: AssertionResult }) {
  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded px-2 py-1 text-xs',
        result.passed ? 'text-foreground' : 'bg-fail/5 text-fail',
      )}
    >
      {result.passed ? (
        <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-pass" />
      ) : (
        <XCircle className="mt-0.5 h-3 w-3 shrink-0 text-fail" />
      )}
      <div>
        <span>{result.assertion.description}</span>
        {result.location && (
          <span className="ml-2 text-muted-foreground">
            L{result.location.line}:{result.location.column}
          </span>
        )}
        {!result.passed && result.message && (
          <div className="mt-0.5 text-muted-foreground">{result.message}</div>
        )}
      </div>
    </div>
  );
}
