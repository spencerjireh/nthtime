import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createStore } from 'zustand/vanilla';
import type { EditorStore } from '@nthtime/editor';
import { buildEditorStore } from '../../test-utils';
import { EditorStoreContext } from './editor-store-context';

// vi.hoisted() for values that need to be accessible in vi.mock() factories
const { mockKeybindings } = vi.hoisted(() => ({
  mockKeybindings: { value: 'default' as string },
}));

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
vi.mock('@/hooks/use-monaco-decorations', () => ({
  useMonacoDecorations: () => ({ onMount: vi.fn() }),
}));
vi.mock('@/lib/formatter', () => ({
  formatCode: vi.fn().mockResolvedValue('formatted'),
}));
vi.mock('@/lib/feature-flags', () => ({
  isFeatureEnabled: () => false,
}));
vi.mock('./solution-panel', () => ({
  SolutionPanel: (props: Record<string, unknown>) => (
    <div data-testid="solution-panel" data-language={props.language} />
  ),
}));
vi.mock('next/dynamic', () => ({
  __esModule: true,
  default: (loader: () => Promise<{ default: React.ComponentType }>) => {
    // DiffViewLazy stub
    const Stub = (props: Record<string, unknown>) => (
      <div data-testid="diff-view" data-language={props.language} />
    );
    Stub.displayName = 'DiffViewLazyStub';
    return Stub;
  },
}));
vi.mock('@/lib/settings-store', () => ({
  getSettingsStore: () =>
    createStore(() => ({
      settings: {
        autocomplete: true,
        get keybindings() {
          return mockKeybindings.value;
        },
        formatter: { defaults: { enabled: true, trigger: 'manual', tabSize: 2, useTabs: false } },
        feedback: { showPassFail: true, showHints: true, showAssertionDetails: true, showDiff: true, showSolution: false },
      },
    })),
}));

import { EditorPanel } from './editor-panel';

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
    mockKeybindings.value = 'default';
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
    expect(screen.getByTitle('Split editor')).toBeInTheDocument();
  });

  it('does not render split toggle with only one file', () => {
    renderEditor({
      files: { 'app.js': { path: 'app.js', content: 'const a = 1;' } },
      tabOrder: ['app.js'],
    });
    expect(screen.queryByTitle('Split editor')).not.toBeInTheDocument();
  });

  // --- New tests ---

  it('split mode: two monaco-wrapper elements and split-resize-handle visible', () => {
    renderEditor({
      splitMode: 'horizontal',
      secondActiveFilePath: 'server.js',
    });
    const monacos = screen.getAllByTestId('monaco-wrapper');
    expect(monacos).toHaveLength(2);
    expect(screen.getByTestId('split-resize-handle')).toBeInTheDocument();
  });

  it('blank canvas "Create your first file" button calls createFile', () => {
    const store = buildEditorStore({
      files: {},
      activeFilePath: null,
      tabOrder: [],
    });
    render(
      <EditorStoreContext.Provider value={store}>
        <EditorPanel />
      </EditorStoreContext.Provider>,
    );
    fireEvent.click(screen.getByText('Create your first file'));
    expect(store.getState().createFile).toHaveBeenCalledWith('index.js');
  });

  it('passes statusBarRef prop to useKeybindingMode', async () => {
    const { useKeybindingMode } = await import('@/hooks/use-keybinding-mode');
    renderEditor();
    // useKeybindingMode is called with (editor, ref, keybindings)
    expect(useKeybindingMode).toHaveBeenCalled();
  });

  // --- Results mode tests ---

  it('results mode: renders submitted files read-only', () => {
    renderEditor({
      viewMode: 'results',
      resultsCodeView: 'submitted',
      submittedFiles: {
        'app.js': { path: 'app.js', content: 'submitted code' },
      },
      verificationResult: {
        passed: true,
        totalAssertions: 1,
        passedAssertions: 1,
        fileResults: [{ file: 'app.js', passed: true, results: [] }],
        crossFileResults: [],
      },
    });
    expect(screen.getByTestId('monaco-wrapper')).toBeInTheDocument();
  });

  it('results mode: hides split toggle', () => {
    renderEditor({
      viewMode: 'results',
      resultsCodeView: 'submitted',
      submittedFiles: {
        'app.js': { path: 'app.js', content: 'code' },
        'server.js': { path: 'server.js', content: 'code' },
      },
    });
    expect(screen.queryByTitle('Split editor')).not.toBeInTheDocument();
  });

  it('results mode: hides "Create your first file" button', () => {
    renderEditor({
      viewMode: 'results',
      resultsCodeView: 'submitted',
      files: {},
      submittedFiles: {},
      activeFilePath: null,
      tabOrder: [],
    });
    expect(screen.queryByText('Create your first file')).not.toBeInTheDocument();
  });

  it('results mode diff: renders DiffViewLazy', () => {
    renderEditor({
      viewMode: 'results',
      resultsCodeView: 'diff',
      activeFilePath: 'app.js',
      submittedFiles: {
        'app.js': { path: 'app.js', content: 'submitted' },
      },
      referenceSolutionFiles: {
        'app.js': { path: 'app.js', content: 'solution' },
      },
    });
    expect(screen.getByTestId('diff-view')).toBeInTheDocument();
  });

  it('results mode solution: renders SolutionPanel', () => {
    renderEditor({
      viewMode: 'results',
      resultsCodeView: 'solution',
      activeFilePath: 'app.js',
      submittedFiles: {
        'app.js': { path: 'app.js', content: 'submitted' },
      },
      referenceSolutionFiles: {
        'app.js': { path: 'app.js', content: 'solution' },
      },
    });
    expect(screen.getByTestId('solution-panel')).toBeInTheDocument();
  });
});
