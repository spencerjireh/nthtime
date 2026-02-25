'use client';

import { useCallback, useMemo, useRef } from 'react';
import { useStore } from 'zustand';
import { createEditorStore, getMonacoLanguage } from '@nthtime/editor';
import type { StoreApi } from 'zustand/vanilla';
import type { EditorStore } from '@nthtime/editor';
import { Difficulty } from '@nthtime/shared';
import { FileTree } from '@/components/challenge/file-tree';
import { TabBar } from '@/components/challenge/tab-bar';
import { MonacoWrapper } from '@/components/challenge/monaco-wrapper';
import { useTheme } from 'next-themes';

interface FileEditorTabProps {
  /** Initial files to populate the editor with */
  initialFiles: { path: string; content: string }[];
  /** Called whenever files change so parent can stay in sync */
  onChange?: (files: { path: string; content: string }[]) => void;
}

export function FileEditorTab({ initialFiles, onChange }: FileEditorTabProps) {
  // Create a stable editor store for this tab instance
  const storeRef = useRef<StoreApi<EditorStore> | null>(null);
  if (!storeRef.current) {
    const store = createEditorStore();
    // Initialize with provided files (using a minimal challenge shape)
    store.getState().initFromChallenge(
      {
        title: '',
        prompt: '',
        difficulty: Difficulty.Beginner,
        tags: [],
        timeEstimateSeconds: 0,
        scaffolded: true,
        files: initialFiles.length > 0 ? initialFiles : [{ path: 'index.ts', content: '' }],
        hints: [],
      },
      undefined,
    );
    storeRef.current = store;
  }
  const store = storeRef.current;

  const files = useStore(store, (s) => s.files);
  const activeFilePath = useStore(store, (s) => s.activeFilePath);
  const tabOrder = useStore(store, (s) => s.tabOrder);

  const { resolvedTheme } = useTheme();
  const monacoTheme = resolvedTheme === 'dark' ? 'vs-dark' : 'light';

  const filePaths = useMemo(() => Object.keys(files), [files]);
  const activeContent = activeFilePath ? files[activeFilePath]?.content ?? '' : '';
  const language = activeFilePath ? getMonacoLanguage(activeFilePath) : 'plaintext';

  const isDirty = useCallback((path: string) => store.getState().isDirty(path), [store]);

  const handleFileChange = useCallback(
    (value: string | undefined) => {
      if (activeFilePath && value !== undefined) {
        store.getState().setFileContent(activeFilePath, value);
        // Notify parent of all files
        onChange?.(
          Object.values(store.getState().files).map((f) => ({
            path: f.path,
            content: f.content,
          })),
        );
      }
    },
    [activeFilePath, store, onChange],
  );

  const handleCreateFile = useCallback(
    (path: string) => {
      store.getState().createFile(path, '');
      onChange?.(
        Object.values(store.getState().files).map((f) => ({
          path: f.path,
          content: f.content,
        })),
      );
    },
    [store, onChange],
  );

  const handleRenameFile = useCallback(
    (oldPath: string, newPath: string) => {
      store.getState().renameFile(oldPath, newPath);
      onChange?.(
        Object.values(store.getState().files).map((f) => ({
          path: f.path,
          content: f.content,
        })),
      );
    },
    [store, onChange],
  );

  const handleDeleteFile = useCallback(
    (path: string) => {
      store.getState().deleteFile(path);
      onChange?.(
        Object.values(store.getState().files).map((f) => ({
          path: f.path,
          content: f.content,
        })),
      );
    },
    [store, onChange],
  );

  return (
    <div className="flex h-[500px] overflow-hidden rounded-md border border-border">
      <FileTree
        files={filePaths}
        activeFile={activeFilePath}
        isDirty={isDirty}
        onSelect={(path) => store.getState().openTab(path)}
        onCreateFile={handleCreateFile}
        onRenameFile={handleRenameFile}
        onDeleteFile={handleDeleteFile}
      />
      <div className="flex flex-1 flex-col">
        <TabBar
          tabs={tabOrder}
          activeTab={activeFilePath}
          isDirty={isDirty}
          onSelect={(path) => store.getState().setActiveFile(path)}
          onClose={(path) => store.getState().closeTab(path)}
          onReorder={(from, to) => store.getState().reorderTabs(from, to)}
        />
        <div className="flex-1">
          {activeFilePath ? (
            <MonacoWrapper
              value={activeContent}
              language={language}
              theme={monacoTheme}
              onChange={handleFileChange}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Select or create a file
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Imperative helper: extract current files from a FileEditorTab's store.
 * Since FileEditorTab manages its own store internally, this is exposed
 * via the onChange callback instead.
 */
