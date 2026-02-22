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
vi.mock('@/lib/formatter', () => ({
  formatCode: vi.fn().mockResolvedValue('formatted'),
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

  it('vim keybinding: status bar div is rendered', () => {
    mockKeybindings.value = 'vim';
    const { container } = renderEditor();
    // Status bar has font-mono class and appears when keybindings !== 'default'
    const statusBar = container.querySelector('.font-mono.text-xs');
    expect(statusBar).toBeInTheDocument();
  });

  it('default keybinding: no status bar', () => {
    mockKeybindings.value = 'default';
    const { container } = renderEditor();
    // The status bar border-t div shouldn't be present in default mode
    // Query for the status bar's specific class combination
    const statusBars = container.querySelectorAll('[class*="border-t"][class*="font-mono"]');
    expect(statusBars).toHaveLength(0);
  });
});
