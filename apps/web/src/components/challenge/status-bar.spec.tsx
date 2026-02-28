import React, { createRef } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createStore } from 'zustand/vanilla';
import type { EditorStore } from '@nthtime/editor';
import { buildEditorStore } from '../../test-utils';
import { EditorStoreContext } from './editor-store-context';

const { mockFormatterTrigger, mockFormatAllFiles } = vi.hoisted(() => ({
  mockFormatterTrigger: { value: 'manual' as string },
  mockFormatAllFiles: vi.fn().mockResolvedValue(new Map()),
}));

vi.mock('@/lib/settings-store', () => ({
  getSettingsStore: () =>
    createStore(() => ({
      settings: {
        formatter: {
          defaults: {
            enabled: true,
            get trigger() {
              return mockFormatterTrigger.value;
            },
            tabSize: 2,
            useTabs: false,
          },
        },
      },
    })),
}));
vi.mock('@/lib/formatter', () => ({
  formatAllFiles: (...args: unknown[]) => mockFormatAllFiles(...args),
}));

import { StatusBar } from './status-bar';

function renderStatusBar(
  overrides?: Partial<EditorStore>,
  props?: {
    isPromptCollapsed?: boolean;
    keybindings?: 'default' | 'vim' | 'emacs';
  },
) {
  const store = buildEditorStore(overrides);
  const onRun = vi.fn();
  const onPromptToggle = vi.fn();
  const statusBarRef = createRef<HTMLDivElement>();

  const result = render(
    <EditorStoreContext.Provider value={store}>
      <StatusBar
        onRun={onRun}
        isPromptCollapsed={props?.isPromptCollapsed ?? false}
        onPromptToggle={onPromptToggle}
        statusBarRef={statusBarRef}
        keybindings={props?.keybindings ?? 'default'}
      />
    </EditorStoreContext.Provider>,
  );

  return { ...result, store, onRun, onPromptToggle, statusBarRef };
}

describe('StatusBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFormatterTrigger.value = 'manual';
  });

  it('renders Run button', () => {
    renderStatusBar();
    expect(screen.getByTitle('Run (Ctrl+Enter)')).toBeInTheDocument();
    expect(screen.getByText('Run')).toBeInTheDocument();
  });

  it('Run button calls onRun', () => {
    const { onRun } = renderStatusBar();
    fireEvent.click(screen.getByTitle('Run (Ctrl+Enter)'));
    expect(onRun).toHaveBeenCalledOnce();
  });

  it('Run button is disabled when running', () => {
    renderStatusBar({ runState: 'running' });
    expect(screen.getByTitle('Run (Ctrl+Enter)')).toBeDisabled();
    expect(screen.getByText('Running...')).toBeInTheDocument();
  });

  it('shows language display name for active file', () => {
    renderStatusBar({ activeFilePath: 'index.ts' });
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('shows JavaScript for .js files', () => {
    renderStatusBar({ activeFilePath: 'app.js' });
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
  });

  it('hides language when no active file', () => {
    renderStatusBar({ activeFilePath: null });
    expect(screen.queryByText('JavaScript')).not.toBeInTheDocument();
    expect(screen.queryByText('TypeScript')).not.toBeInTheDocument();
  });

  it('shows Format button when trigger is manual', () => {
    mockFormatterTrigger.value = 'manual';
    renderStatusBar();
    expect(screen.getByTitle('Format code')).toBeInTheDocument();
  });

  it('hides Format button when trigger is onSave', () => {
    mockFormatterTrigger.value = 'onSave';
    renderStatusBar();
    expect(screen.queryByTitle('Format code')).not.toBeInTheDocument();
  });

  it('prompt toggle calls onPromptToggle', () => {
    const { onPromptToggle } = renderStatusBar();
    fireEvent.click(screen.getByTitle('Hide prompt (Ctrl+B)'));
    expect(onPromptToggle).toHaveBeenCalledOnce();
  });

  it('prompt toggle shows "Show prompt" when collapsed', () => {
    renderStatusBar(undefined, { isPromptCollapsed: true });
    expect(screen.getByTitle('Show prompt (Ctrl+B)')).toBeInTheDocument();
  });

  it('shows keybinding status span when keybindings is vim', () => {
    const { container } = renderStatusBar(undefined, { keybindings: 'vim' });
    expect(container.querySelector('.font-mono')).toBeInTheDocument();
  });

  it('hides keybinding status span when keybindings is default', () => {
    const { container } = renderStatusBar(undefined, { keybindings: 'default' });
    expect(container.querySelector('.font-mono')).not.toBeInTheDocument();
  });
});
