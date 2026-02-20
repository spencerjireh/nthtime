'use client';

import { useEditorStore } from './editor-store-context';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function OutputPanel() {
  const runState = useEditorStore((s) => s.runState);
  const result = useEditorStore((s) => s.verificationResult);

  if (runState === 'idle' && !result) {
    return (
      <div className="flex h-full flex-col items-center justify-center border-l border-border p-4 text-center text-muted-foreground">
        <p className="text-sm">Press <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs">Ctrl+Enter</kbd> or click Run to verify your code</p>
      </div>
    );
  }

  if (runState === 'running') {
    return (
      <div className="flex h-full items-center justify-center border-l border-border p-4 text-muted-foreground">
        <p className="text-sm">Running verification...</p>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="flex h-full flex-col overflow-y-auto border-l border-border p-4">
      <div className="mb-4">
        <Badge variant={result.passed ? 'pass' : 'fail'} className="text-sm">
          {result.passed ? 'All Passed' : 'Some Failed'}
        </Badge>
        <p className="mt-1 text-xs text-muted-foreground">
          {result.passedAssertions}/{result.totalAssertions} assertions passed
        </p>
      </div>

      <div className="space-y-3">
        {result.fileResults.map((fileResult) => (
          <div key={fileResult.file}>
            <div className="mb-1 flex items-center gap-2">
              <span className="text-xs font-medium text-foreground">
                {fileResult.file}
              </span>
              <Badge
                variant={fileResult.passed ? 'pass' : 'fail'}
                className="text-[10px] px-1.5 py-0"
              >
                {fileResult.passed ? 'pass' : 'fail'}
              </Badge>
            </div>
            <ul className="space-y-1">
              {fileResult.results.map((r, i) => (
                <li
                  key={i}
                  className={cn(
                    'rounded px-2 py-1 text-xs',
                    r.passed
                      ? 'bg-pass/10 text-pass'
                      : 'bg-fail/10 text-fail',
                  )}
                >
                  <span className="mr-1.5">{r.passed ? '[pass]' : '[fail]'}</span>
                  {r.assertion.description}
                  {!r.passed && (
                    <span className="ml-1 text-muted-foreground">
                      -- {r.message}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {result.crossFileResults.length > 0 && (
          <div>
            <div className="mb-1 text-xs font-medium text-foreground">
              Cross-file
            </div>
            <ul className="space-y-1">
              {result.crossFileResults.map((r, i) => (
                <li
                  key={i}
                  className={cn(
                    'rounded px-2 py-1 text-xs',
                    r.passed
                      ? 'bg-pass/10 text-pass'
                      : 'bg-fail/10 text-fail',
                  )}
                >
                  <span className="mr-1.5">{r.passed ? '[pass]' : '[fail]'}</span>
                  {r.assertion.description}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
