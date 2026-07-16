import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// The four tab bodies pull in Monaco, the WASM verifier, and the assertion editor -- none of
// which render in jsdom. This test is about the tab structure (ATHR-13), so stub each body to a
// marker; the tab triggers themselves come from the real Radix Tabs.
vi.mock('./challenge-metadata-tab', () => ({
  ChallengeMetadataTab: () => <div data-testid="metadata-body" />,
}));
vi.mock('./file-editor-tab', () => ({
  FileEditorTab: () => <div data-testid="solution-body" />,
}));
vi.mock('./assertion-editor', () => ({
  AssertionEditor: () => <div data-testid="assertions-body" />,
}));
vi.mock('./validation-panel', () => ({
  ValidationPanel: () => <div data-testid="validate-body" />,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/hooks/use-author', () => ({
  useAuthorPack: () => ({ pack: { name: 'Arrays', slug: 'arrays', challenges: [] } }),
  useCreateChallenge: () => vi.fn(),
  useUpdateChallenge: () => vi.fn(),
}));

import { ChallengeEditor } from './challenge-editor';

describe('ChallengeEditor (ATHR-13)', () => {
  // ATHR-13
  it('renders the four editor tabs: Metadata, Solution, Assertions, Validate', () => {
    render(<ChallengeEditor packSlug="arrays" />);

    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((t) => t.textContent)).toEqual([
      'Metadata',
      'Solution',
      'Assertions',
      'Validate',
    ]);
  });

  // ATHR-13
  it('defaults to the Metadata tab and switches on click', async () => {
    const user = userEvent.setup();
    render(<ChallengeEditor packSlug="arrays" />);

    // Radix only mounts the active tab panel, so the default is Metadata.
    expect(screen.getByTestId('metadata-body')).toBeInTheDocument();
    expect(screen.queryByTestId('validate-body')).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Validate' }));
    expect(await screen.findByTestId('validate-body')).toBeInTheDocument();
  });

  // ATHR-13
  it('shows the New Challenge heading in create mode', () => {
    render(<ChallengeEditor packSlug="arrays" />);
    expect(screen.getByRole('heading', { name: 'New Challenge' })).toBeInTheDocument();
  });
});
