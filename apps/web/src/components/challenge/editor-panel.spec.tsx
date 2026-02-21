import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createStore } from 'zustand/vanilla';
import type { EditorStore } from '@nthtime/editor';
import { EditorStoreContext } from './editor-store-context';

// Stub heavy dependencies
vi.mock('./monaco-wrapper', () => ({
  MonacoWrapper: (props: Record<string, unknown>) => (
    <div data-testid="monaco-wrapper" data-language={props.language} />
  ),
}));
vi.mock('./split-resize-handle', () => ({
  SplitResizeHandle: () => <div data-testid="split-resize-handle" />,
}));
vi.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: 'dark' }),
}));
vi.mock('@/hooks/use-keybinding-mode', () => ({
  useKeybindingMode: vi.fn(),
}));
vi.mock('@/hooks/use-parse-diagnostics', () => ({
  useParseDiagnostics: vi.fn(),
}));
vi.mock('@/lib/formatter', () => ({
  formatCode: vi.fn().mockResolvedValue('formatted'),
}));
vi.mock('@/lib/settings-store', () => ({
  getSettingsStore: () =>
    createStore(() => ({
      settings: {
        autocomplete: true,
        keybindings: 'default',
        formatter: { defaults: { enabled: true, trigger: 'manual', tabSize: 2, useTabs: false } },
      },
    })),
}));

import { EditorPanel } from './editor-panel';

function buildEditorStore(overrides?: Partial<EditorStore>): ReturnType<typeof createStore<EditorStore>> {
  const defaults: EditorStore = {
    files: {
      'app.js': { content: 'const a = 1;', language: 'javascript' },
      'server.js': { content: 'const b = 2;', language: 'javascript' },
    },
    activeFilePath: 'app.js',
    tabOrder: ['app.js', 'server.js'],
    splitMode: 'single',
    secondActiveFilePath: null,
    scaffoldFiles: {
      'app.js': { content: 'const a = 1;', language: 'javascript' },
      'server.js': { content: 'const b = 2;', language: 'javascript' },
    },
    submittedFiles: null,
    viewMode: 'editing',
    verificationResult: null,
    timer: { startedAt: null, elapsedSeconds: 0 },
    hintsRevealed: 0,
    totalHints: 0,
    hints: [],
    initFromChallenge: vi.fn(),
    setActiveFile: vi.fn(),
    setFileContent: vi.fn(),
    startTimer: vi.fn(),
    stopTimer: vi.fn(),
    submit: vi.fn(),
    retry: vi.fn(),
    setViewMode: vi.fn(),
    setVerificationResult: vi.fn(),
    revealNextHint: vi.fn(),
    saveDraft: vi.fn(),
    loadDraft: vi.fn().mockReturnValue(false),
    clearDraft: vi.fn(),
    isDirty: vi.fn().mockReturnValue(false),
    createFile: vi.fn(),
    renameFile: vi.fn(),
    deleteFile: vi.fn(),
    openTab: vi.fn(),
    closeTab: vi.fn(),
    reorderTabs: vi.fn(),
    toggleSplit: vi.fn(),
    setSecondActiveFile: vi.fn(),
    closeSplit: vi.fn(),
    ...overrides,
  };
  return createStore<EditorStore>(() => defaults);
}

function renderEditor(overrides?: Partial<EditorStore>) {
  const store = buildEditorStore(overrides);
  return render(
    <EditorStoreContext.Provider value={store}>
      <EditorPanel />
    </EditorStoreContext.Provider>,
  );
}

describe('EditorPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders tabs from tabOrder', () => {
    renderEditor();
    // File names appear in both TabBar and FileTree
    expect(screen.getAllByText('app.js').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('server.js').length).toBeGreaterThanOrEqual(2);
  });

  it('renders Monaco for active file', () => {
    renderEditor();
    const monaco = screen.getByTestId('monaco-wrapper');
    expect(monaco).toBeInTheDocument();
    expect(monaco).toHaveAttribute('data-language', 'javascript');
  });

  it('shows file tree', () => {
    renderEditor();
    // File tree header
    expect(screen.getByText('Files')).toBeInTheDocument();
  });

  it('shows "Select a file" when activeFilePath is null but files exist', () => {
    renderEditor({ activeFilePath: null });
    expect(screen.getByText('Select a file to edit')).toBeInTheDocument();
  });

  it('shows blank canvas prompt when no files', () => {
    renderEditor({
      files: {},
      activeFilePath: null,
      tabOrder: [],
    });
    expect(screen.getByText('No files yet')).toBeInTheDocument();
    expect(screen.getByText('Create your first file')).toBeInTheDocument();
  });

  it('renders split toggle button when multiple files', () => {
    renderEditor();
    // The split toggle button shows "||" in single mode
    expect(screen.getByTitle('Split editor')).toBeInTheDocument();
  });

  it('does not render split toggle with only one file', () => {
    renderEditor({
      files: { 'app.js': { content: 'const a = 1;', language: 'javascript' } },
      tabOrder: ['app.js'],
    });
    expect(screen.queryByTitle('Split editor')).not.toBeInTheDocument();
  });
});
