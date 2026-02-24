'use client';

import { useCallback, useEffect, useState } from 'react';
import { Group, Panel, Separator, useDefaultLayout } from 'react-resizable-panels';
import { PromptPanel } from './prompt-panel';
import { EditorPanel } from './editor-panel';
import { ChallengeToolbar } from './challenge-toolbar';
import { DEFAULT_LAYOUT, LAYOUT_GROUP_ID, RESET_LAYOUT_EVENT } from './default-layout';

interface DockableLayoutProps {
  onRun: () => void;
  challengeId: string;
  packSlug?: string;
}

export function DockableLayout({ onRun, challengeId, packSlug }: DockableLayoutProps) {
  const [resetKey, setResetKey] = useState(0);

  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: LAYOUT_GROUP_ID,
  });

  const handleReset = useCallback(() => {
    // Clear persisted layout keys
    Object.keys(localStorage)
      .filter((k) => k.startsWith('react-resizable-panels'))
      .forEach((k) => localStorage.removeItem(k));
    // Force remount with defaults
    setResetKey((k) => k + 1);
  }, []);

  useEffect(() => {
    window.addEventListener(RESET_LAYOUT_EVENT, handleReset);
    return () => window.removeEventListener(RESET_LAYOUT_EVENT, handleReset);
  }, [handleReset]);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="min-h-0 flex-1">
        <Group
          key={resetKey}
          id={LAYOUT_GROUP_ID}
          orientation="horizontal"
          defaultLayout={defaultLayout ?? DEFAULT_LAYOUT}
          onLayoutChanged={onLayoutChanged}
        >
          <Panel id="prompt" defaultSize="30%" minSize="15%">
            <PromptPanel />
          </Panel>
          <Separator className="w-1 bg-border transition-colors hover:bg-primary active:bg-primary" />
          <Panel id="editor" defaultSize="70%" minSize="25%">
            <EditorPanel />
          </Panel>
        </Group>
      </div>
      <div className="shrink-0 border-t border-border">
        <ChallengeToolbar onRun={onRun} challengeId={challengeId} packSlug={packSlug} />
      </div>
    </div>
  );
}
