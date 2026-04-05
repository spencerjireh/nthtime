'use client';

import { useTheme } from 'next-themes';
import { MonacoWrapper } from './monaco-wrapper';

interface SolutionPanelProps {
  content: string;
  language: string;
  peek?: boolean;
}

export function SolutionPanel({ content, language, peek = false }: SolutionPanelProps) {
  const { resolvedTheme } = useTheme();
  const monacoTheme = resolvedTheme === 'dark' ? 'vs-dark' : 'light';

  return (
    <div className="flex h-full flex-col" data-testid="solution-panel">
      <div
        className={
          peek
            ? 'flex shrink-0 items-center border-b border-amber-500/40 bg-amber-500/10 px-3 py-1.5'
            : 'flex shrink-0 items-center border-b border-border bg-muted/30 px-3 py-1'
        }
      >
        <span
          className={
            peek
              ? 'text-xs font-medium text-amber-700 dark:text-amber-300'
              : 'text-xs text-muted-foreground'
          }
        >
          {peek ? 'Peeking reference solution' : 'Reference Solution'}
        </span>
      </div>
      <div className="flex-1">
        <MonacoWrapper
          value={content}
          language={language}
          theme={monacoTheme}
          options={{ readOnly: true }}
        />
      </div>
    </div>
  );
}
