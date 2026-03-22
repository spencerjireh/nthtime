import { renderHook } from '@testing-library/react';
import { useTraceMode } from './use-trace-mode';

function createMockModel(content = '') {
  let value = content;
  return {
    getValue: vi.fn(() => value),
    setValue: vi.fn((v: string) => {
      value = v;
    }),
    getLineCount: vi.fn(() => value.split('\n').length),
    getLineMaxColumn: vi.fn(() => 80),
  };
}

function createMockEditor(model = createMockModel()) {
  const decorations = { set: vi.fn() };
  return {
    editor: {
      getModel: vi.fn(() => model),
      createDecorationsCollection: vi.fn(() => decorations),
      onDidScrollChange: vi.fn(() => ({ dispose: vi.fn() })),
      setScrollPosition: vi.fn(),
    },
    model,
    decorations,
  };
}

function createMockMonaco() {
  class MockRange {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
    constructor(sl: number, sc: number, el: number, ec: number) {
      this.startLineNumber = sl;
      this.startColumn = sc;
      this.endLineNumber = el;
      this.endColumn = ec;
    }
  }
  return { Range: MockRange };
}

const refFiles = { 'index.js': { content: 'const a = 1;\nconst b = 2;\n' } };

describe('useTraceMode', () => {
  it('sets ghost editor content from reference solution', () => {
    const ghost = createMockEditor();
    const active = createMockEditor();
    const monaco = createMockMonaco();

    renderHook(() =>
      useTraceMode(
        active.editor as any,
        ghost.editor as any,
        monaco as any,
        'index.js',
        refFiles,
        true,
      ),
    );

    expect(ghost.model.setValue).toHaveBeenCalledWith('const a = 1;\nconst b = 2;\n');
  });

  it('does NOT modify active editor content', () => {
    const ghost = createMockEditor();
    const active = createMockEditor();
    const monaco = createMockMonaco();

    renderHook(() =>
      useTraceMode(
        active.editor as any,
        ghost.editor as any,
        monaco as any,
        'index.js',
        refFiles,
        true,
      ),
    );

    expect(active.model.setValue).not.toHaveBeenCalled();
  });

  it('sets up scroll listener on active editor', () => {
    const ghost = createMockEditor();
    const active = createMockEditor();
    const monaco = createMockMonaco();

    renderHook(() =>
      useTraceMode(
        active.editor as any,
        ghost.editor as any,
        monaco as any,
        'index.js',
        refFiles,
        true,
      ),
    );

    expect(active.editor.onDidScrollChange).toHaveBeenCalledOnce();
  });

  it('disposes scroll listener on cleanup', () => {
    const disposeFn = vi.fn();
    const ghost = createMockEditor();
    const active = createMockEditor();
    active.editor.onDidScrollChange = vi.fn(() => ({ dispose: disposeFn }));
    const monaco = createMockMonaco();

    const { unmount } = renderHook(() =>
      useTraceMode(
        active.editor as any,
        ghost.editor as any,
        monaco as any,
        'index.js',
        refFiles,
        true,
      ),
    );

    unmount();
    expect(disposeFn).toHaveBeenCalled();
  });

  it('cleans up decorations and scroll listener when disabled', () => {
    const disposeFn = vi.fn();
    const ghost = createMockEditor();
    const active = createMockEditor();
    active.editor.onDidScrollChange = vi.fn(() => ({ dispose: disposeFn }));
    const monaco = createMockMonaco();

    const { rerender } = renderHook(
      ({ enabled }) =>
        useTraceMode(
          active.editor as any,
          ghost.editor as any,
          monaco as any,
          'index.js',
          refFiles,
          enabled,
        ),
      { initialProps: { enabled: true } },
    );

    rerender({ enabled: false });

    expect(disposeFn).toHaveBeenCalled();
    expect(ghost.decorations.set).toHaveBeenLastCalledWith([]);
  });

  it('is a no-op when editors are null', () => {
    const { unmount } = renderHook(() =>
      useTraceMode(null, null, null, 'index.js', refFiles, true),
    );

    // Should not throw
    unmount();
  });
});
