import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const mockPacks = { value: [] as unknown[], isLoading: false };

vi.mock('@/hooks/use-author', () => ({
  useMyPacks: () => ({ packs: mockPacks.value, isLoading: mockPacks.isLoading }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

import { AuthorDashboard } from './author-dashboard';

const samplePack = {
  _id: '1',
  name: 'Express Basics',
  slug: 'express-basics',
  description: 'Learn Express',
  language: 'javascript',
  framework: 'express',
  version: '1.0.0',
  tags: [] as string[],
  prerequisites: [] as string[],
  visibility: 'public',
  challengeCount: 3,
  createdAt: null,
  updatedAt: null,
};

beforeEach(() => {
  mockPacks.value = [];
  mockPacks.isLoading = false;
});

// ATHR-01 -- authenticated authors see a "My Packs" dashboard listing their packs.
describe('AuthorDashboard', () => {
  it('renders the My Packs heading and a New Pack action', () => {
    render(<AuthorDashboard />);
    expect(screen.getByRole('heading', { name: 'My Packs' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /new pack/i })).toBeInTheDocument();
  });

  it('shows an empty state when the author has no packs', () => {
    render(<AuthorDashboard />);
    expect(screen.getByText('No packs yet.')).toBeInTheDocument();
  });

  it('lists each pack with its name, language, visibility, and challenge count', () => {
    mockPacks.value = [samplePack];
    render(<AuthorDashboard />);

    expect(screen.getByRole('heading', { name: 'Express Basics' })).toBeInTheDocument();
    expect(screen.getByText('javascript')).toBeInTheDocument();
    expect(screen.getByText('public')).toBeInTheDocument();
    expect(screen.getByText('3 challenges')).toBeInTheDocument();
  });

  it('singularizes the challenge count for a one-challenge pack', () => {
    mockPacks.value = [{ ...samplePack, challengeCount: 1 }];
    render(<AuthorDashboard />);
    expect(screen.getByText('1 challenge')).toBeInTheDocument();
  });

  it('renders a spinner while packs are loading', () => {
    mockPacks.isLoading = true;
    const { container } = render(<AuthorDashboard />);
    // The loading branch renders the LogoSpinner (an svg), not the empty-state copy.
    expect(screen.queryByText('No packs yet.')).not.toBeInTheDocument();
    expect(container.querySelector('svg')).not.toBeNull();
  });
});
