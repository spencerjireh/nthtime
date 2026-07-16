import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Suspense } from 'react';
import { render, screen, act } from '@testing-library/react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { mockPack, mockChallenge } = vi.hoisted(() => ({
  mockPack: { value: null as any, isLoading: false },
  mockChallenge: { value: null as any, isLoading: false },
}));

vi.mock('@/hooks/use-author', () => ({
  useAuthorPack: () => ({ pack: mockPack.value, isLoading: mockPack.isLoading }),
  useAuthorChallenge: () => ({
    challenge: mockChallenge.value,
    isLoading: mockChallenge.isLoading,
  }),
}));

// ChallengeView is the heavy student surface (editor store + dynamic panels); stub it and
// expose the props the preview page threads into it.
vi.mock('@/components/challenge/challenge-view', () => ({
  ChallengeView: (props: {
    challengeId: string;
    packSlug: string;
    challenge: { title: string };
  }) => (
    <div
      data-testid="challenge-view"
      data-challenge-id={props.challengeId}
      data-pack={props.packSlug}
    >
      {props.challenge.title}
    </div>
  ),
}));

import PreviewRoute from './page';

// `PreviewRoute` unwraps its params promise with React `use()`, which suspends on first render.
// Flush that microtask inside act() so the tree commits before we query.
async function renderPreview() {
  await act(async () => {
    render(
      <Suspense fallback={<div>suspense</div>}>
        <PreviewRoute params={Promise.resolve({ slug: 'arrays', challengeSlug: 'two-sum' })} />
      </Suspense>,
    );
  });
}

const CHALLENGE = {
  _id: 'c1',
  slug: 'two-sum',
  title: 'Two Sum',
  prompt: 'Return indices',
  difficulty: 'beginner',
  tags: [],
  timeEstimateSeconds: 300,
  hints: [],
  assertions: { perFile: {}, crossFile: [] },
  referenceSolution: [],
};

beforeEach(() => {
  mockPack.value = { name: 'Arrays', slug: 'arrays', challenges: [{ _id: 'c1', slug: 'two-sum' }] };
  mockPack.isLoading = false;
  mockChallenge.value = CHALLENGE;
  mockChallenge.isLoading = false;
});

describe('Author preview page (ATHR-17, ATHR-18)', () => {
  // ATHR-17
  it('renders ChallengeView with the author challenge data', async () => {
    await renderPreview();
    const view = await screen.findByTestId('challenge-view');
    expect(view).toHaveTextContent('Two Sum');
    expect(view).toHaveAttribute('data-challenge-id', 'preview-c1');
    expect(view).toHaveAttribute('data-pack', 'arrays');
  });

  // ATHR-18
  it('shows the amber preview banner distinguishing it from the student view', async () => {
    await renderPreview();
    const banner = await screen.findByText('Preview Mode');
    expect(banner.className).toContain('amber');
    expect(screen.getByRole('link', { name: /back to editor/i })).toBeInTheDocument();
  });

  // ATHR-17 -- missing challenge resolves to a not-found message, not a crash.
  it('shows "Challenge not found." when the slug is absent from the pack', async () => {
    mockPack.value = { name: 'Arrays', slug: 'arrays', challenges: [] };
    await renderPreview();
    expect(await screen.findByText('Challenge not found.')).toBeInTheDocument();
  });
});
