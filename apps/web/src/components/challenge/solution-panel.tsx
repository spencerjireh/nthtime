'use client';

import { MonacoWrapper } from './monaco-wrapper';

interface SolutionPanelProps {
  content: string;
  language: string;
}

export function SolutionPanel({ content, language }: SolutionPanelProps) {
  return (
    <div className="flex h-full flex-col" data-testid="solution-panel">
      <div className="flex shrink-0 items-center border-b border-border bg-muted/30 px-3 py-1">
        <span className="text-xs text-muted-foreground">Reference Solution</span>
      </div>
      <div className="flex-1">
        <MonacoWrapper
          value={content}
          language={language}
          theme="vs-dark"
          options={{ readOnly: true }}
        />
      </div>
    </div>
  );
}
