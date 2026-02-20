'use client';

import { useState } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { cn } from '@/lib/utils';

interface DiffViewProps {
  originalContent: string;
  modifiedContent: string;
  language: string;
}

export function DiffView({
  originalContent,
  modifiedContent,
  language,
}: DiffViewProps) {
  const [renderSideBySide, setRenderSideBySide] = useState(true);

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-muted/30 px-3 py-1">
        <span className="text-xs text-muted-foreground">
          Scaffold vs Submitted
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setRenderSideBySide(true)}
            className={cn(
              'rounded px-2 py-0.5 text-xs transition-colors',
              renderSideBySide
                ? 'bg-background text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Side by side
          </button>
          <button
            onClick={() => setRenderSideBySide(false)}
            className={cn(
              'rounded px-2 py-0.5 text-xs transition-colors',
              !renderSideBySide
                ? 'bg-background text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Inline
          </button>
        </div>
      </div>
      <div className="flex-1">
        <DiffEditor
          original={originalContent}
          modified={modifiedContent}
          language={language}
          theme="vs-dark"
          options={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 14,
            minimap: { enabled: false },
            automaticLayout: true,
            scrollBeyondLastLine: false,
            padding: { top: 12 },
            readOnly: true,
            renderSideBySide,
          }}
        />
      </div>
    </div>
  );
}
