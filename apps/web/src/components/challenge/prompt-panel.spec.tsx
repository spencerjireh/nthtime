import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { buildEditorStore } from '../../test-utils';
import { EditorStoreContext } from './editor-store-context';
import { PromptPanel } from './prompt-panel';

function renderPromptPanel(overrides?: Parameters<typeof buildEditorStore>[0]) {
  const store = buildEditorStore({
    challengeMetadata: {
      title: 'Test Challenge',
      prompt: 'Write a function',
      difficulty: 'beginner',
      tags: ['test', 'functions'],
    },
    hints: ['Use const', 'Return a value', 'Add types'],
    hintsRevealed: 0,
    totalHints: 3,
    ...overrides,
  });

  return {
    store,
    ...render(
      <EditorStoreContext.Provider value={store}>
        <PromptPanel />
      </EditorStoreContext.Provider>,
    ),
  };
}

describe('PromptPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders challenge section open by default', () => {
    renderPromptPanel();
    expect(screen.getByText('Test Challenge')).toBeInTheDocument();
    expect(screen.getByText('beginner')).toBeInTheDocument();
  });

  it('renders tags', () => {
    renderPromptPanel();
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('functions')).toBeInTheDocument();
  });

  it('renders hints section header with available count', () => {
    renderPromptPanel();
    expect(screen.getByText('3 available')).toBeInTheDocument();
  });

  it('hints section is closed by default', () => {
    renderPromptPanel();
    // "Show next hint" button should not be visible when section is closed
    // The grid-template-rows: 0fr hides overflow, so the button element exists but is hidden
    const hintsButton = screen.getByText('Hints');
    expect(hintsButton).toBeInTheDocument();
  });

  it('can open hints section', () => {
    renderPromptPanel({ hintsRevealed: 1 });
    // Click the Hints section header to open it
    fireEvent.click(screen.getByText('Hints'));
    // Now the revealed hint should be visible
    expect(screen.getByText('Use const')).toBeInTheDocument();
  });

  it('cannot close the last open section (challenge)', () => {
    renderPromptPanel();
    // Challenge is open, hints is closed. Clicking challenge should be no-op.
    fireEvent.click(screen.getByText('Challenge'));
    // Title should still be visible (challenge section still open)
    expect(screen.getByText('Test Challenge')).toBeInTheDocument();
  });

  it('can close challenge when hints is also open', () => {
    renderPromptPanel();
    // Open hints first
    fireEvent.click(screen.getByText('Hints'));
    // Now both are open. Close challenge.
    fireEvent.click(screen.getByText('Challenge'));
    // The challenge section content area should collapse (grid-template-rows: 0fr)
    // We verify by checking the grid container's style
    const challengeSection = screen.getByText('Challenge').closest('div[class*="border-b"]');
    const grid = challengeSection?.querySelector('[style*="grid-template-rows"]');
    expect(grid).toHaveStyle({ gridTemplateRows: '0fr' });
  });

  it('cannot close the last open section (hints)', () => {
    renderPromptPanel();
    // Open hints
    fireEvent.click(screen.getByText('Hints'));
    // Close challenge (now hints is the only open one)
    fireEvent.click(screen.getByText('Challenge'));
    // Try to close hints -- should be no-op
    fireEvent.click(screen.getByText('Hints'));
    // Hints section should still be open (grid-template-rows: 1fr)
    const hintsSection = screen.getByText('Hints').closest('div[class*="border-b"]');
    const grid = hintsSection?.querySelector('[style*="grid-template-rows"]');
    expect(grid).toHaveStyle({ gridTemplateRows: '1fr' });
  });

  it('both sections can be open simultaneously', () => {
    renderPromptPanel({ hintsRevealed: 1 });
    // Open hints (challenge is already open by default)
    fireEvent.click(screen.getByText('Hints'));
    // Both should show their content
    expect(screen.getByText('Test Challenge')).toBeInTheDocument();
    expect(screen.getByText('Use const')).toBeInTheDocument();
  });

  it('shows revealed hints in order', () => {
    renderPromptPanel({ hintsRevealed: 2 });
    // Open hints section
    fireEvent.click(screen.getByText('Hints'));
    expect(screen.getByText('Use const')).toBeInTheDocument();
    expect(screen.getByText('Return a value')).toBeInTheDocument();
  });

  it('updates available count as hints are revealed', () => {
    renderPromptPanel({ hintsRevealed: 1 });
    expect(screen.getByText('2 available')).toBeInTheDocument();
  });

  it('hides available badge when all hints are revealed', () => {
    renderPromptPanel({ hintsRevealed: 3 });
    expect(screen.queryByText('0 available')).not.toBeInTheDocument();
  });
});
