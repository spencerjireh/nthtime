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
import { ChevronsUp } from 'lucide-react';
import { PromptPanel } from './prompt-panel';
import { EditorPanel } from './editor-panel';
import { ChallengeToolbar } from './challenge-toolbar';
import { useEditorStore } from './editor-store-context';
import { DEFAULT_LAYOUT, LAYOUT_GROUP_ID, RESET_LAYOUT_EVENT, clearPanelStorage } from './default-layout';
import { getSettingsStore } from '@/lib/settings-store';

interface DockableLayoutProps {
  onRun: () => void;
  challengeId: string;
  packSlug?: string;
}

export function DockableLayout({ onRun, challengeId, packSlug }: DockableLayoutProps) {
  const [resetKey, setResetKey] = useState(0);
  const promptPanelRef = usePanelRef();
  const mountedRef = useRef(false);

  const timerStartedAt = useEditorStore((s) => s.timer.startedAt);
  const tickTimer = useEditorStore((s) => s.tickTimer);

  const store = getSettingsStore();
  const promptCollapsed = useStore(store, (s) => s.settings.promptCollapsed);
  const toolbarCollapsed = useStore(store, (s) => s.settings.toolbarCollapsed);

  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: LAYOUT_GROUP_ID,
  });

  const handleReset = useCallback(() => {
    clearPanelStorage();
    setResetKey((k) => k + 1);
  }, []);

  // Tick the timer every second while running (lives here so it survives toolbar collapse)
  useEffect(() => {
    if (timerStartedAt === null) return;
    const interval = setInterval(tickTimer, 1000);
    return () => clearInterval(interval);
  }, [timerStartedAt, tickTimer]);

  useEffect(() => {
    window.addEventListener(RESET_LAYOUT_EVENT, handleReset);
    return () => window.removeEventListener(RESET_LAYOUT_EVENT, handleReset);
  }, [handleReset]);

  // Sync prompt panel collapsed state on mount
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    if (promptCollapsed) {
      // Small delay to let the panel mount before collapsing
      requestAnimationFrame(() => {
        promptPanelRef.current?.collapse();
      });
    }
  }, [promptCollapsed, promptPanelRef]);

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

  const toggleToolbar = useCallback(() => {
    const current = store.getState().settings.toolbarCollapsed;
    store.getState().setToolbarCollapsed(!current);
  }, [store]);

  const showToolbar = useCallback(() => {
    store.getState().setToolbarCollapsed(false);
  }, [store]);

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

  // All keyboard shortcuts live here so they work even when toolbar is collapsed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;

      // Ctrl+Enter: run
      if (mod && e.key === 'Enter') {
        e.preventDefault();
        onRun();
        return;
      }

      // Ctrl+Shift+B: toggle toolbar
      if (mod && e.shiftKey && e.key === 'B') {
        e.preventDefault();
        toggleToolbar();
        return;
      }

      // Ctrl+B: toggle prompt panel
      if (mod && e.key === 'b') {
        e.preventDefault();
        togglePrompt();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRun, togglePrompt, toggleToolbar]);

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
            <PromptPanel />
          </Panel>
          <Separator className="w-1 bg-border transition-colors hover:bg-primary active:bg-primary" />
          <Panel id="editor" defaultSize="70%" minSize="25%">
            <EditorPanel />
          </Panel>
        </Group>
      </div>
      {!toolbarCollapsed ? (
        <div className="shrink-0 border-t border-border">
          <ChallengeToolbar
            onRun={onRun}
            challengeId={challengeId}
            packSlug={packSlug}
            isPromptCollapsed={promptCollapsed}
            onPromptToggle={togglePrompt}
            onToolbarCollapse={toggleToolbar}
          />
        </div>
      ) : (
        <button
          className="absolute bottom-3 right-3 z-10 rounded-md border border-border bg-muted/80 p-1.5 text-muted-foreground backdrop-blur-sm hover:text-foreground"
          onClick={showToolbar}
          title="Show toolbar (Ctrl+Shift+B)"
        >
          <ChevronsUp className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
