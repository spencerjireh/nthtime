import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Capture every store the component builds so we can assert it owns a private instance.
const { createdStores } = vi.hoisted(() => ({ createdStores: [] as unknown[] }));

vi.mock('@nthtime/editor', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@nthtime/editor')>();
  return {
    ...actual,
    createEditorStore: vi.fn((...args: Parameters<typeof actual.createEditorStore>) => {
      const store = actual.createEditorStore(...args);
      createdStores.push(store);
      return store;
    }),
  };
});

// Monaco does not render in jsdom -- stub it and surface the props we assert on.
vi.mock('@/components/challenge/monaco-wrapper', () => ({
  MonacoWrapper: (props: { value: string; language: string }) => (
    <div data-testid="monaco-wrapper" data-language={props.language}>
      {props.value}
    </div>
  ),
}));

vi.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: 'light' }),
}));

import { FileEditorTab } from './file-editor-tab';

describe('FileEditorTab (ATHR-14)', () => {
  // ATHR-14
  it('mounts a Monaco editor backed by its own EditorStore seeded with the initial files', () => {
    createdStores.length = 0;
    render(
      <FileEditorTab
        initialFiles={[{ path: 'solution.ts', content: 'export const answer = 42;' }]}
      />,
    );

    // Its own store instance, initialized with the provided reference solution.
    expect(createdStores).toHaveLength(1);
    const store = createdStores[0] as ReturnType<
      typeof import('@nthtime/editor').createEditorStore
    >;
    expect(store.getState().files['solution.ts'].content).toBe('export const answer = 42;');

    // Monaco is rendered for the (auto-selected) active file, language mapped from extension.
    const monaco = screen.getByTestId('monaco-wrapper');
    expect(monaco).toHaveTextContent('export const answer = 42;');
    expect(monaco).toHaveAttribute('data-language', 'typescript');
  });

  // ATHR-14 -- each instance owns a distinct store (no shared module singleton).
  it('gives each instance a distinct store', () => {
    createdStores.length = 0;
    render(<FileEditorTab initialFiles={[{ path: 'a.ts', content: '1' }]} />);
    render(<FileEditorTab initialFiles={[{ path: 'b.ts', content: '2' }]} />);

    expect(createdStores).toHaveLength(2);
    expect(createdStores[0]).not.toBe(createdStores[1]);
  });
});
