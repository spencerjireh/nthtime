'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from 'zustand';
import {
  Group,
  Panel,
  Separator,
  useDefaultLayout,
  usePanelRef,
} from 'react-resizable-panels';
import { PromptPanel } from './prompt-panel';
import { ResultsPanel } from './results-panel';
import { EditorPanel } from './editor-panel';
import { StatusBar } from './status-bar';
import { DEFAULT_LAYOUT, LAYOUT_GROUP_ID, RESET_LAYOUT_EVENT, clearPanelStorage } from './default-layout';
import { useEditorStore } from './editor-store-context';
import { getSettingsStore } from '@/lib/settings-store';

interface DockableLayoutProps {
  onRun: () => void;
  onRetry: () => void;
  onReset: () => void;
  packSlug?: string;
  challengeIds?: string[];
}

export function DockableLayout({ onRun, onRetry, onReset, packSlug, challengeIds }: DockableLayoutProps) {
  const [resetKey, setResetKey] = useState(0);
  const promptPanelRef = usePanelRef();
  const mountedRef = useRef(false);
  const statusBarRef = useRef<HTMLDivElement>(null);

  const viewMode = useEditorStore((s) => s.viewMode);
  const tabOrder = useEditorStore((s) => s.tabOrder);
  const activeFilePath = useEditorStore((s) => s.activeFilePath);
  const setActiveFile = useEditorStore((s) => s.setActiveFile);
  const closeTab = useEditorStore((s) => s.closeTab);
  const store = getSettingsStore();
  const promptCollapsed = useStore(store, (s) => s.settings.promptCollapsed);
  const keybindings = useStore(store, (s) => s.settings.keybindings);
  const isResults = viewMode === 'results';

  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: LAYOUT_GROUP_ID,
  });

  const handleLayoutReset = useCallback(() => {
    clearPanelStorage();
    setResetKey((k) => k + 1);
  }, []);

  useEffect(() => {
    window.addEventListener(RESET_LAYOUT_EVENT, handleLayoutReset);
    return () => window.removeEventListener(RESET_LAYOUT_EVENT, handleLayoutReset);
  }, [handleLayoutReset]);

  // Sync prompt panel collapsed state on mount
  useEffect(() => {
    if (mountedRef.current) return undefined;
    mountedRef.current = true;
    if (promptCollapsed) {
      // Small delay to let the panel mount before collapsing
      const raf = requestAnimationFrame(() => {
        promptPanelRef.current?.collapse();
      });
      return () => cancelAnimationFrame(raf);
    }
    return undefined;
  }, []);

  const togglePrompt = useCallback(() => {
    const panel = promptPanelRef.current;
    if (!panel) return;
    if (panel.isCollapsed()) {
      panel.expand();
      store.getState().setPromptCollapsed(false);
    } else {
      panel.collapse();
      store.getState().setPromptCollapsed(true);
    }
  }, [promptPanelRef, store]);

  // Handle panel collapse/expand via drag (user drags panel to zero)
  const handlePromptResize = useCallback(
    (size: { asPercentage: number }) => {
      const isCollapsed = size.asPercentage === 0;
      const current = store.getState().settings.promptCollapsed;
      if (isCollapsed !== current) {
        store.getState().setPromptCollapsed(isCollapsed);
      }
    },
    [store],
  );

  // Auto-expand left panel when results come in
  useEffect(() => {
    if (isResults && promptPanelRef.current?.isCollapsed()) {
      promptPanelRef.current.expand();
    }
  }, [isResults, promptPanelRef]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;

      // Ctrl+Enter: run
      if (mod && e.key === 'Enter') {
        e.preventDefault();
        onRun();
        return;
      }

      // Ctrl+B: toggle prompt panel
      if (mod && e.key === 'b') {
        e.preventDefault();
        togglePrompt();
        return;
      }

      // Cmd+Shift+G: toggle trace mode
      if (mod && e.shiftKey && (e.key === 'g' || e.key === 'G')) {
        e.preventDefault();
        const s = store.getState();
        s.setTraceMode(!s.settings.traceMode);
        return;
      }

      // Cmd+Shift+[ : previous tab
      if (mod && e.shiftKey && e.key === '[') {
        e.preventDefault();
        const idx = tabOrder.indexOf(activeFilePath ?? '');
        if (idx > 0) setActiveFile(tabOrder[idx - 1]);
        return;
      }

      // Cmd+Shift+] : next tab
      if (mod && e.shiftKey && e.key === ']') {
        e.preventDefault();
        const idx = tabOrder.indexOf(activeFilePath ?? '');
        if (idx < tabOrder.length - 1) setActiveFile(tabOrder[idx + 1]);
        return;
      }

      // Ctrl+Tab / Ctrl+Shift+Tab: cycle tabs (wrapping)
      if (e.ctrlKey && e.key === 'Tab') {
        e.preventDefault();
        if (tabOrder.length < 2) return;
        const idx = tabOrder.indexOf(activeFilePath ?? '');
        const next = e.shiftKey
          ? idx <= 0 ? tabOrder.length - 1 : idx - 1
          : idx >= tabOrder.length - 1 ? 0 : idx + 1;
        setActiveFile(tabOrder[next]);
        return;
      }

      // Ctrl+1–9: jump to tab by position
      if (e.ctrlKey && !e.shiftKey && !e.metaKey && e.key >= '1' && e.key <= '9') {
        const target = parseInt(e.key) - 1;
        if (target < tabOrder.length) {
          e.preventDefault();
          setActiveFile(tabOrder[target]);
        }
        return;
      }

      // Ctrl+W: close active tab
      if (e.ctrlKey && !e.shiftKey && e.key === 'w') {
        e.preventDefault();
        if (activeFilePath) closeTab(activeFilePath);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRun, togglePrompt, tabOrder, activeFilePath, setActiveFile, closeTab]);

  return (
    <div className="relative flex h-full w-full flex-col">
      <div className="min-h-0 flex-1">
        <Group
          key={resetKey}
          id={LAYOUT_GROUP_ID}
          orientation="horizontal"
          defaultLayout={defaultLayout ?? DEFAULT_LAYOUT}
          onLayoutChanged={onLayoutChanged}
        >
          <Panel
            id="prompt"
            defaultSize="30%"
            minSize="15%"
            collapsible
            collapsedSize="0%"
            panelRef={promptPanelRef}
            onResize={handlePromptResize}
          >
            {isResults ? (
              <ResultsPanel
                onRetry={onRetry}
                packSlug={packSlug}
                challengeIds={challengeIds}
              />
            ) : (
              <PromptPanel />
            )}
          </Panel>
          <Separator className="w-1 bg-border transition-colors hover:bg-primary active:bg-primary" />
          <Panel id="editor" defaultSize="70%" minSize="25%">
            <EditorPanel statusBarRef={statusBarRef} />
          </Panel>
        </Group>
      </div>
      <StatusBar
        onRun={onRun}
        onReset={onReset}
        isPromptCollapsed={promptCollapsed}
        onPromptToggle={togglePrompt}
        statusBarRef={statusBarRef}
        keybindings={keybindings}
      />
    </div>
  );
}
