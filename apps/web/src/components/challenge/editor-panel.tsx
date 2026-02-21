'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { useStore } from 'zustand';
import type { OnMount } from '@monaco-editor/react';
import { useEditorStore } from './editor-store-context';
import { MonacoWrapper } from './monaco-wrapper';
import { getMonacoLanguage } from '@nthtime/editor';
import { getSettingsStore } from '@/lib/settings-store';
import { useKeybindingMode } from '@/hooks/use-keybinding-mode';
import { FileTree } from './file-tree';
import { cn } from '@/lib/utils';

export function EditorPanel() {
  const files = useEditorStore((s) => s.files);
  const activeFilePath = useEditorStore((s) => s.activeFilePath);
  const setActiveFile = useEditorStore((s) => s.setActiveFile);
  const setFileContent = useEditorStore((s) => s.setFileContent);
  const startTimer = useEditorStore((s) => s.startTimer);
  const autocomplete = useStore(getSettingsStore(), (s) => s.settings.autocomplete);
  const keybindings = useStore(getSettingsStore(), (s) => s.settings.keybindings);
  const { resolvedTheme } = useTheme();

  const isDirty = useEditorStore((s) => s.isDirty);
  const filePaths = Object.keys(files);
  const showFileTree = filePaths.length >= 3;
  const activeFile = activeFilePath ? files[activeFilePath] : null;

  const [editorInstance, setEditorInstance] = useState<Parameters<OnMount>[0] | null>(null);
  const statusBarRef = useRef<HTMLDivElement>(null);

  useKeybindingMode(editorInstance, statusBarRef, keybindings);

  const monacoOptions = useMemo(
    () =>
      autocomplete
        ? {}
        : ({ quickSuggestions: false, suggestOnTriggerCharacters: false } as const),
    [autocomplete],
  );

  const handleMount: OnMount = useCallback((ed) => {
    setEditorInstance(ed);
  }, []);

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
            {isDirty(path) && (
              <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-teal-400" />
            )}
          </button>
        ))}
      </div>
      <div className="flex min-h-0 flex-1">
        {showFileTree && (
          <FileTree
            files={filePaths}
            activeFile={activeFilePath}
            isDirty={isDirty}
            onSelect={setActiveFile}
          />
        )}
        <div className="flex-1">
          {activeFile ? (
            <MonacoWrapper
              value={activeFile.content}
              language={language}
              theme={monacoTheme}
              onChange={handleChange}
              onMount={handleMount}
              options={monacoOptions}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Select a file to edit
            </div>
          )}
        </div>
      </div>
      {keybindings !== 'default' && (
        <div
          ref={statusBarRef}
          className="shrink-0 border-t border-border bg-muted/30 px-3 py-1 font-mono text-xs text-muted-foreground"
        />
      )}
    </div>
  );
}
