import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createStore } from 'zustand/vanilla';
import { buildEditorStore } from '../../test-utils';
import { EditorStoreContext } from './editor-store-context';

const { mockShowSolution, mockSolutionFeatureFlag } = vi.hoisted(() => ({
  mockShowSolution: { value: true },
  mockSolutionFeatureFlag: { value: true },
}));

vi.mock('react-resizable-panels', () => ({
  Group: ({ children }: { children: React.ReactNode }) => <div data-testid="group">{children}</div>,
  Panel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Separator: () => <div data-testid="separator" />,
  useDefaultLayout: () => ({ defaultLayout: null, onLayoutChanged: vi.fn() }),
  usePanelRef: () => ({
    current: {
      collapse: vi.fn(),
      expand: vi.fn(),
      isCollapsed: vi.fn(() => false),
    },
  }),
}));

vi.mock('./prompt-panel', () => ({
  PromptPanel: () => <div data-testid="prompt-panel" />,
}));
vi.mock('./results-panel', () => ({
  ResultsPanel: () => <div data-testid="results-panel" />,
}));
vi.mock('./status-bar', () => ({
  StatusBar: () => <div data-testid="status-bar" />,
}));
vi.mock('./editor-panel', () => ({
  EditorPanel: ({ isPeekingSolution }: { isPeekingSolution?: boolean }) => (
    <div data-testid="editor-panel" data-peek={String(Boolean(isPeekingSolution))} />
  ),
}));
vi.mock('@/lib/feature-flags', () => ({
  isFeatureEnabled: (flag: string) => flag === 'solutionView' && mockSolutionFeatureFlag.value,
}));
vi.mock('@/lib/settings-store', () => ({
  getSettingsStore: () =>
    createStore(() => ({
      settings: {
        promptCollapsed: false,
        keybindings: 'default',
        feedback: {
          showSolution: mockShowSolution.value,
        },
      },
      setPromptCollapsed: vi.fn(),
    })),
}));

import { DockableLayout } from './dockable-layout';

function renderLayout(showSolution = true) {
  mockShowSolution.value = showSolution;
  const store = buildEditorStore({
    activeFilePath: 'app.js',
    referenceSolutionFiles: {
      'app.js': { path: 'app.js', content: 'solution' },
      'solution.ts': { path: 'solution.ts', content: 'export {}' },
    },
  });

  return render(
    <EditorStoreContext.Provider value={store}>
      <DockableLayout onRun={vi.fn()} onRetry={vi.fn()} onReset={vi.fn()} />
    </EditorStoreContext.Provider>,
  );
}

describe('DockableLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockShowSolution.value = true;
    mockSolutionFeatureFlag.value = true;
  });

  it('holds Cmd/Ctrl+Alt+S to enable temporary solution peek', () => {
    renderLayout();

    fireEvent.keyDown(window, { key: 's', metaKey: true, altKey: true });
    expect(screen.getByTestId('editor-panel')).toHaveAttribute('data-peek', 'true');

    fireEvent.keyUp(window, { key: 's', metaKey: true, altKey: true });
    expect(screen.getByTestId('editor-panel')).toHaveAttribute('data-peek', 'false');
  });

  it('clears temporary solution peek on window blur', () => {
    renderLayout();

    fireEvent.keyDown(window, { key: 's', ctrlKey: true, altKey: true });
    expect(screen.getByTestId('editor-panel')).toHaveAttribute('data-peek', 'true');

    fireEvent.blur(window);
    expect(screen.getByTestId('editor-panel')).toHaveAttribute('data-peek', 'false');
  });

  it('does not peek when solution access is disabled', () => {
    renderLayout(false);

    fireEvent.keyDown(window, { key: 's', metaKey: true, altKey: true });

    expect(screen.getByTestId('editor-panel')).toHaveAttribute('data-peek', 'false');
  });
});
