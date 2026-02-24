'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { useStore } from 'zustand';
import type { OnMount } from '@monaco-editor/react';
import { useEditorStore } from './editor-store-context';
import { MonacoWrapper } from './monaco-wrapper';
import { getMonacoLanguage } from '@nthtime/editor';
import { getSettingsStore } from '@/lib/settings-store';
import { useKeybindingMode } from '@/hooks/use-keybinding-mode';
import { FileTree } from './file-tree';
import { TabBar } from './tab-bar';
import { SplitResizeHandle } from './split-resize-handle';
import { useParseDiagnostics } from '@/hooks/use-parse-diagnostics';
import { formatCode } from '@/lib/formatter';

export function EditorPanel() {
  const files = useEditorStore((s) => s.files);
  const activeFilePath = useEditorStore((s) => s.activeFilePath);
  const tabOrder = useEditorStore((s) => s.tabOrder);
  const splitMode = useEditorStore((s) => s.splitMode);
  const secondActiveFilePath = useEditorStore((s) => s.secondActiveFilePath);
  const setActiveFile = useEditorStore((s) => s.setActiveFile);
  const setFileContent = useEditorStore((s) => s.setFileContent);
  const startTimer = useEditorStore((s) => s.startTimer);
  const openTab = useEditorStore((s) => s.openTab);
  const closeTab = useEditorStore((s) => s.closeTab);
  const reorderTabs = useEditorStore((s) => s.reorderTabs);
  const toggleSplit = useEditorStore((s) => s.toggleSplit);
  const setSecondActiveFile = useEditorStore((s) => s.setSecondActiveFile);
  const autocomplete = useStore(getSettingsStore(), (s) => s.settings.autocomplete);
  const keybindings = useStore(getSettingsStore(), (s) => s.settings.keybindings);
  const formatter = useStore(getSettingsStore(), (s) => s.settings.formatter);
  const { resolvedTheme } = useTheme();

  const createFile = useEditorStore((s) => s.createFile);
  const renameFile = useEditorStore((s) => s.renameFile);
  const deleteFile = useEditorStore((s) => s.deleteFile);
  const isDirty = useEditorStore((s) => s.isDirty);
  const filePaths = Object.keys(files);
  const activeFile = activeFilePath ? files[activeFilePath] : null;
  const secondFile = secondActiveFilePath ? files[secondActiveFilePath] : null;

  const [editorInstance, setEditorInstance] = useState<Parameters<OnMount>[0] | null>(null);
  const [monacoInstance, setMonacoInstance] = useState<Parameters<OnMount>[1] | null>(null);
  const statusBarRef = useRef<HTMLDivElement>(null);
  const [splitFraction, setSplitFraction] = useState(0.5);

  useKeybindingMode(editorInstance, statusBarRef, keybindings);
  useParseDiagnostics(editorInstance, monacoInstance, activeFilePath, activeFile?.content);

  // Format on save (Cmd/Ctrl+S)
  useEffect(() => {
    if (formatter.defaults.trigger !== 'onSave') return;
    const handler = async (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (!activeFilePath || !activeFile) return;
        const formatted = await formatCode(activeFile.content, activeFilePath, formatter.defaults);
        if (formatted !== activeFile.content) {
          setFileContent(activeFilePath, formatted);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [formatter.defaults, activeFilePath, activeFile, setFileContent]);

  const monacoOptions = useMemo(
    () =>
      autocomplete
        ? {}
        : ({ quickSuggestions: false, suggestOnTriggerCharacters: false } as const),
    [autocomplete],
  );

  const handleMount: OnMount = useCallback((ed, mon) => {
    setEditorInstance(ed);
    setMonacoInstance(mon);
  }, []);

  const handleChange = useCallback(
    (value: string | undefined) => {
      if (!activeFilePath || value === undefined) return;
      startTimer();
      setFileContent(activeFilePath, value);
    },
    [activeFilePath, setFileContent, startTimer],
  );

  const handleSecondChange = useCallback(
    (value: string | undefined) => {
      if (!secondActiveFilePath || value === undefined) return;
      startTimer();
      setFileContent(secondActiveFilePath, value);
    },
    [secondActiveFilePath, setFileContent, startTimer],
  );

  const handleFileSelect = useCallback(
    (path: string) => {
      openTab(path);
    },
    [openTab],
  );

  const monacoTheme = resolvedTheme === 'dark' ? 'vs-dark' : 'light';
  const language = activeFilePath ? getMonacoLanguage(activeFilePath) : 'plaintext';
  const secondLanguage = secondActiveFilePath
    ? getMonacoLanguage(secondActiveFilePath)
    : 'plaintext';

  const splitToggleButton = (
    <button
      onClick={toggleSplit}
      className="px-2 text-xs text-muted-foreground hover:text-foreground"
      title={splitMode === 'single' ? 'Split editor' : 'Close split'}
    >
      {splitMode === 'single' ? '||' : '|'}
    </button>
  );

  const isHorizontalSplit = splitMode === 'horizontal' && secondFile;

  return (
    <div className="flex h-full flex-col">
      <TabBar
        tabs={tabOrder}
        activeTab={activeFilePath}
        isDirty={isDirty}
        onSelect={setActiveFile}
        onClose={closeTab}
        onReorder={reorderTabs}
        trailing={filePaths.length > 1 ? splitToggleButton : undefined}
      />
      <div className="flex min-h-0 flex-1">
        <FileTree
          files={filePaths}
          activeFile={activeFilePath}
          isDirty={isDirty}
          onSelect={handleFileSelect}
          onCreateFile={createFile}
          onRenameFile={renameFile}
          onDeleteFile={deleteFile}
        />
        <div className="flex flex-1">
          <div style={isHorizontalSplit ? { width: `${splitFraction * 100}%` } : { flex: 1 }}>
            {activeFile ? (
              <MonacoWrapper
                value={activeFile.content}
                language={language}
                theme={monacoTheme}
                onChange={handleChange}
                onMount={handleMount}
                options={monacoOptions}
              />
            ) : filePaths.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                <p className="text-sm">No files yet</p>
                <button
                  onClick={() => createFile('index.js')}
                  className="rounded border border-border px-3 py-1.5 text-xs hover:bg-muted hover:text-foreground"
                >
                  Create your first file
                </button>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Select a file to edit
              </div>
            )}
          </div>
          {isHorizontalSplit && (
            <>
              <SplitResizeHandle onResize={setSplitFraction} />
              <div style={{ width: `${(1 - splitFraction) * 100}%` }}>
                <div className="flex items-center border-b border-border bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
                  <select
                    value={secondActiveFilePath ?? ''}
                    onChange={(e) => setSecondActiveFile(e.target.value)}
                    className="bg-transparent text-xs outline-none"
                  >
                    {filePaths.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <MonacoWrapper
                  value={secondFile.content}
                  language={secondLanguage}
                  theme={monacoTheme}
                  onChange={handleSecondChange}
                  options={monacoOptions}
                />
              </div>
            </>
          )}
        </div>
      </div>
      {keybindings !== 'default' && (
        <div
          ref={statusBarRef}
          className="shrink-0 border-t border-border bg-muted/30 px-3 py-1 text-xs text-muted-foreground"
        />
      )}
    </div>
  );
}
