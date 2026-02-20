'use client';

import { useCallback } from 'react';
import { useTheme } from 'next-themes';
import { useEditorStore } from './editor-store-context';
import { MonacoWrapper } from './monaco-wrapper';
import { getMonacoLanguage } from '@nthtime/editor';
import { cn } from '@/lib/utils';

export function EditorPanel() {
  const files = useEditorStore((s) => s.files);
  const activeFilePath = useEditorStore((s) => s.activeFilePath);
  const setActiveFile = useEditorStore((s) => s.setActiveFile);
  const setFileContent = useEditorStore((s) => s.setFileContent);
  const startTimer = useEditorStore((s) => s.startTimer);
  const { resolvedTheme } = useTheme();

  const filePaths = Object.keys(files);
  const activeFile = activeFilePath ? files[activeFilePath] : null;

  const handleChange = useCallback(
    (value: string | undefined) => {
      if (!activeFilePath || value === undefined) return;
      startTimer();
      setFileContent(activeFilePath, value);
    },
    [activeFilePath, setFileContent, startTimer],
  );

  const monacoTheme = resolvedTheme === 'dark' ? 'vs-dark' : 'light';
  const language = activeFilePath ? getMonacoLanguage(activeFilePath) : 'plaintext';

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 border-b border-border bg-muted/30">
        {filePaths.map((path) => (
          <button
            key={path}
            onClick={() => setActiveFile(path)}
            className={cn(
              'border-r border-border px-3 py-1.5 text-xs transition-colors',
              path === activeFilePath
                ? 'bg-background text-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {path}
          </button>
        ))}
      </div>
      <div className="flex-1">
        {activeFile ? (
          <MonacoWrapper
            value={activeFile.content}
            language={language}
            theme={monacoTheme}
            onChange={handleChange}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Select a file to edit
          </div>
        )}
      </div>
    </div>
  );
}
