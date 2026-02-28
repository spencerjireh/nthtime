'use client';

import { useCallback, useEffect, useMemo, useState, type RefObject } from 'react';
import { useTheme } from 'next-themes';
import { useStore } from 'zustand';
import dynamic from 'next/dynamic';
import type { OnMount } from '@monaco-editor/react';
import { useEditorStore } from './editor-store-context';
import { MonacoWrapper } from './monaco-wrapper';
import { SolutionPanel } from './solution-panel';
import { getMonacoLanguage } from '@nthtime/editor';
import { getSettingsStore } from '@/lib/settings-store';
import { useKeybindingMode } from '@/hooks/use-keybinding-mode';
import { useMonacoDecorations } from '@/hooks/use-monaco-decorations';
import { FileTree } from './file-tree';
import { TabBar } from './tab-bar';
import { SplitResizeHandle } from './split-resize-handle';
import { useParseDiagnostics } from '@/hooks/use-parse-diagnostics';
import { formatCode } from '@/lib/formatter';

// Lazy-loaded diff view
const DiffViewLazy = dynamic(
  () => import('./diff-view').then((m) => ({ default: m.DiffView })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-background text-muted-foreground">
        Loading diff view...
      </div>
    ),
  },
);

interface EditorPanelProps {
  statusBarRef?: RefObject<HTMLDivElement | null>;
}

export function EditorPanel({ statusBarRef }: EditorPanelProps) {
  const files = useEditorStore((s) => s.files);
  const activeFilePath = useEditorStore((s) => s.activeFilePath);
  const tabOrder = useEditorStore((s) => s.tabOrder);
  const splitMode = useEditorStore((s) => s.splitMode);
  const secondActiveFilePath = useEditorStore((s) => s.secondActiveFilePath);
  const setActiveFile = useEditorStore((s) => s.setActiveFile);
  const setFileContent = useEditorStore((s) => s.setFileContent);
  const openTab = useEditorStore((s) => s.openTab);
  const closeTab = useEditorStore((s) => s.closeTab);
  const reorderTabs = useEditorStore((s) => s.reorderTabs);
  const toggleSplit = useEditorStore((s) => s.toggleSplit);
  const setSecondActiveFile = useEditorStore((s) => s.setSecondActiveFile);
  const autocomplete = useStore(getSettingsStore(), (s) => s.settings.autocomplete);
  const keybindings = useStore(getSettingsStore(), (s) => s.settings.keybindings);
  const formatter = useStore(getSettingsStore(), (s) => s.settings.formatter);
  const feedback = useStore(getSettingsStore(), (s) => s.settings.feedback);
  const { resolvedTheme } = useTheme();

  // Results mode state
  const viewMode = useEditorStore((s) => s.viewMode);
  const resultsCodeView = useEditorStore((s) => s.resultsCodeView);
  const submittedFiles = useEditorStore((s) => s.submittedFiles);
  const referenceSolutionFiles = useEditorStore((s) => s.referenceSolutionFiles);
  const verificationResult = useEditorStore((s) => s.verificationResult);
  const isResults = viewMode === 'results';

  const createFile = useEditorStore((s) => s.createFile);
  const renameFile = useEditorStore((s) => s.renameFile);
  const deleteFile = useEditorStore((s) => s.deleteFile);

  // In results mode, show submitted files; in editing mode, show current files
  const displayFiles = isResults && submittedFiles ? submittedFiles : files;
  const filePaths = Object.keys(displayFiles);
  const activeFile = activeFilePath ? displayFiles[activeFilePath] : null;
  const secondFile = secondActiveFilePath ? displayFiles[secondActiveFilePath] : null;

  const [editorInstance, setEditorInstance] = useState<Parameters<OnMount>[0] | null>(null);
  const [monacoInstance, setMonacoInstance] = useState<Parameters<OnMount>[1] | null>(null);
  const [splitFraction, setSplitFraction] = useState(0.5);

  useKeybindingMode(editorInstance, statusBarRef ?? { current: null }, keybindings);
  useParseDiagnostics(editorInstance, monacoInstance, activeFilePath, activeFile?.content);

  // Decorations for results mode
  const showGlyphMargin = isResults && feedback.showAssertionDetails;
  const { onMount: handleResultsMount } = useMonacoDecorations(
    isResults ? verificationResult : null,
    activeFilePath,
    feedback.showAssertionDetails,
  );

  // Format on save (Cmd/Ctrl+S) - only in editing mode
  useEffect(() => {
    if (isResults) return;
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
  }, [isResults, formatter.defaults, activeFilePath, activeFile, setFileContent]);

  const monacoOptions = useMemo(() => {
    const base = autocomplete
      ? {}
      : { quickSuggestions: false, suggestOnTriggerCharacters: false };
    if (isResults) {
      return { ...base, readOnly: true, glyphMargin: showGlyphMargin };
    }
    return base;
  }, [autocomplete, isResults, showGlyphMargin]);

  const handleMount: OnMount = useCallback(
    (ed, mon) => {
      setEditorInstance(ed);
      setMonacoInstance(mon);
      if (isResults) {
        handleResultsMount(ed, mon);
      }
    },
    [isResults, handleResultsMount],
  );

  const handleChange = useCallback(
    (value: string | undefined) => {
      if (isResults) return;
      if (!activeFilePath || value === undefined) return;
      setFileContent(activeFilePath, value);
    },
    [isResults, activeFilePath, setFileContent],
  );

  const handleSecondChange = useCallback(
    (value: string | undefined) => {
      if (isResults) return;
      if (!secondActiveFilePath || value === undefined) return;
      setFileContent(secondActiveFilePath, value);
    },
    [isResults, secondActiveFilePath, setFileContent],
  );

  const handleFileSelect = useCallback(
    (path: string) => {
      if (isResults) {
        setActiveFile(path);
      } else {
        openTab(path);
      }
    },
    [isResults, openTab, setActiveFile],
  );

  const getFileStatus = useCallback(
    (path: string): 'pass' | 'fail' | null => {
      if (!isResults || !verificationResult) return null;
      const fileResult = verificationResult.fileResults.find((f) => f.file === path);
      if (!fileResult) return null;
      return fileResult.passed ? 'pass' : 'fail';
    },
    [isResults, verificationResult],
  );

  const monacoTheme = resolvedTheme === 'dark' ? 'vs-dark' : 'light';
  const language = activeFilePath ? getMonacoLanguage(activeFilePath) : 'plaintext';
  const secondLanguage = secondActiveFilePath
    ? getMonacoLanguage(secondActiveFilePath)
    : 'plaintext';

  const splitToggleButton = !isResults ? (
    <button
      onClick={toggleSplit}
      className="px-2 text-xs text-muted-foreground hover:text-foreground"
      title={splitMode === 'single' ? 'Split editor' : 'Close split'}
    >
      {splitMode === 'single' ? '||' : '|'}
    </button>
  ) : undefined;

  const isHorizontalSplit = !isResults && splitMode === 'horizontal' && secondFile;

  // Determine what to render in the main editor area based on results code view
  const renderMainEditor = () => {
    if (!activeFile) {
      if (filePaths.length === 0) {
        return (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
            <p className="text-sm">No files yet</p>
            {!isResults && (
              <button
                onClick={() => createFile('index.js')}
                className="rounded border border-border px-3 py-1.5 text-xs hover:bg-muted hover:text-foreground"
              >
                Create your first file
              </button>
            )}
          </div>
        );
      }
      return (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          Select a file to edit
        </div>
      );
    }

    if (isResults && resultsCodeView === 'diff' && referenceSolutionFiles && activeFilePath) {
      return (
        <DiffViewLazy
          originalContent={activeFile.content}
          modifiedContent={referenceSolutionFiles[activeFilePath]?.content ?? ''}
          language={language}
        />
      );
    }

    if (isResults && resultsCodeView === 'solution' && referenceSolutionFiles && activeFilePath) {
      return (
        <SolutionPanel
          content={referenceSolutionFiles[activeFilePath]?.content ?? ''}
          language={language}
        />
      );
    }

    return (
      <MonacoWrapper
        value={activeFile.content}
        language={language}
        theme={monacoTheme}
        onChange={handleChange}
        onMount={handleMount}
        options={monacoOptions}
      />
    );
  };

  return (
    <div className="flex h-full flex-col">
      <TabBar
        tabs={tabOrder}
        activeTab={activeFilePath}
        onSelect={setActiveFile}
        onClose={isResults ? undefined : closeTab}
        onReorder={isResults ? undefined : reorderTabs}
        trailing={filePaths.length > 1 ? splitToggleButton : undefined}
      />
      <div className="flex min-h-0 flex-1">
        <FileTree
          files={filePaths}
          activeFile={activeFilePath}
          onSelect={handleFileSelect}
          onCreateFile={isResults ? undefined : createFile}
          onRenameFile={isResults ? undefined : renameFile}
          onDeleteFile={isResults ? undefined : deleteFile}
          fileStatus={isResults ? getFileStatus : undefined}
        />
        <div className="flex flex-1">
          <div style={isHorizontalSplit ? { width: `${splitFraction * 100}%` } : { flex: 1 }}>
            {renderMainEditor()}
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
    </div>
  );
}
