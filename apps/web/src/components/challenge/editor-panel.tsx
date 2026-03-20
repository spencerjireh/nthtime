'use client';

import { useCallback, useEffect, useMemo, useState, type RefObject } from 'react';
import { useTheme } from 'next-themes';
import { useStore } from 'zustand';
import dynamic from 'next/dynamic';
import type { OnMount } from '@monaco-editor/react';
import { toast } from 'sonner';
import { useEditorStore } from './editor-store-context';
import { MonacoWrapper } from './monaco-wrapper';
import { SolutionPanel } from './solution-panel';
import { getMonacoLanguage } from '@nthtime/editor';
import { getSettingsStore } from '@/lib/settings-store';
import { useKeybindingMode } from '@/hooks/use-keybinding-mode';
import { useMonacoDecorations } from '@/hooks/use-monaco-decorations';
import { FileTree } from './file-tree';
import { TabBar } from './tab-bar';
import { useParseDiagnostics } from '@/hooks/use-parse-diagnostics';
import { useTraceMode } from '@/hooks/use-trace-mode';
import { formatCode } from '@/lib/formatter';
import { LogoSpinner } from '@/components/ui/logo-spinner';

// Lazy-loaded diff view
const DiffViewLazy = dynamic(
  () => import('./diff-view').then((m) => ({ default: m.DiffView })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-background">
        <LogoSpinner label="Loading diff view..." />
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
  const setActiveFile = useEditorStore((s) => s.setActiveFile);
  const setFileContent = useEditorStore((s) => s.setFileContent);
  const openTab = useEditorStore((s) => s.openTab);
  const closeTab = useEditorStore((s) => s.closeTab);
  const reorderTabs = useEditorStore((s) => s.reorderTabs);
  const traceMode = useStore(getSettingsStore(), (s) => s.settings.traceMode);
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

  const [editorInstance, setEditorInstance] = useState<Parameters<OnMount>[0] | null>(null);
  const [monacoInstance, setMonacoInstance] = useState<Parameters<OnMount>[1] | null>(null);

  useKeybindingMode(editorInstance, statusBarRef ?? { current: null }, keybindings);
  useParseDiagnostics(editorInstance, monacoInstance, activeFilePath, activeFile?.content);
  useTraceMode(editorInstance, monacoInstance, activeFilePath, referenceSolutionFiles, traceMode && !isResults);

  // Restore editor focus when returning to editing mode (e.g., after Retry).
  // Without this, clicking UI buttons (Run, Retry) leaves focus on the button,
  // and vim/emacs key handlers (registered via Monaco's onKeyDown) never fire.
  useEffect(() => {
    if (!isResults && editorInstance) {
      const raf = requestAnimationFrame(() => {
        editorInstance.focus();
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [isResults, editorInstance]);

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

  // Modified-since-last-verify indicator
  const modifiedPaths = useMemo(() => {
    if (!submittedFiles) return undefined;
    const set = new Set<string>();
    for (const path of tabOrder) {
      if (files[path]?.content !== submittedFiles[path]?.content) {
        set.add(path);
      }
    }
    return set.size > 0 ? set : undefined;
  }, [files, submittedFiles, tabOrder]);

  const monacoOptions = useMemo(() => {
    const base = autocomplete
      ? {}
      : { quickSuggestions: false, suggestOnTriggerCharacters: false };
    if (isResults) {
      return { ...base, readOnly: true, glyphMargin: showGlyphMargin };
    }
    return { ...base };
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

  const handleFileSelect = useCallback(
    (path: string) => {
      if (isResults) {
        setActiveFile(path);
      } else {
        if (!files[path]) {
          createFile(path, '');
        }
        openTab(path);
      }
    },
    [isResults, openTab, setActiveFile, files, createFile],
  );

  const handleDeleteFile = useCallback(
    (path: string) => {
      const content = files[path]?.content ?? '';
      deleteFile(path);
      toast('File deleted', {
        description: path,
        action: {
          label: 'Undo',
          onClick: () => createFile(path, content),
        },
        duration: 5000,
      });
    },
    [files, deleteFile, createFile],
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

  // Ghost files: reference solution files that the user hasn't created yet
  const ghostFilePaths = useMemo(() => {
    if (!traceMode || !referenceSolutionFiles || isResults) return [];
    return Object.keys(referenceSolutionFiles).filter((p) => !files[p]);
  }, [traceMode, referenceSolutionFiles, files, isResults]);

  const monacoTheme = resolvedTheme === 'dark' ? 'vs-dark' : 'light';
  const language = activeFilePath ? getMonacoLanguage(activeFilePath) : 'plaintext';

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
    <div className="flex h-full">
      <FileTree
        files={filePaths}
        activeFile={activeFilePath}
        onSelect={handleFileSelect}
        onCreateFile={isResults ? undefined : createFile}
        onRenameFile={isResults ? undefined : renameFile}
        onDeleteFile={isResults ? undefined : handleDeleteFile}
        fileStatus={isResults ? getFileStatus : undefined}
        ghostFiles={ghostFilePaths}
      />
      <div className="flex min-h-0 flex-1 flex-col">
        <TabBar
          tabs={tabOrder}
          activeTab={activeFilePath}
          onSelect={setActiveFile}
          onClose={isResults ? undefined : closeTab}
          onReorder={isResults ? undefined : reorderTabs}
          modifiedPaths={modifiedPaths}
        />
        <div className="min-h-0 flex-1">
          {renderMainEditor()}
        </div>
      </div>
    </div>
  );
}
