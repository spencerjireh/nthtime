import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { Profile } from '@/lib/api-client';

const mockAuthStatus = { value: 'authenticated' as string };
const mockProfile = { value: null as Profile | null };
const mockSignOut = vi.fn();

vi.mock('@/hooks/use-auth-session', () => ({
  useAuthSession: () => ({
    status: mockAuthStatus.value,
    userId: mockAuthStatus.value === 'authenticated' ? 'user-1' : null,
  }),
}));

vi.mock('@/hooks/use-profile', () => ({
  useProfile: () => ({ profile: mockProfile.value, isLoading: false }),
}));

vi.mock('@/hooks/use-sign-out', () => ({
  useSignOut: () => mockSignOut,
}));

import { UserMenu } from './user-menu';

const fullProfile: Profile = {
  userId: '1',
  name: 'Spencer Jireh',
  email: 'spencer@example.com',
  image: 'https://avatars.githubusercontent.com/u/1?v=4',
  provider: 'github',
  handle: 'spencerjireh',
  createdAt: '2026-03-15T00:00:00Z',
};

beforeEach(() => {
  mockSignOut.mockReset();
  mockAuthStatus.value = 'authenticated';
  mockProfile.value = fullProfile;
});

describe('UserMenu', () => {
  // The avatar is decorative (alt=""), so it has no img role -- the button's
  // aria-label carries the name. Query the DOM directly.
  it('renders the avatar image when the profile has one', async () => {
    const { container } = render(<UserMenu />);

    await waitFor(() => expect(container.querySelector('img')).not.toBeNull());
    expect(container.querySelector('img')).toHaveAttribute('src', fullProfile.image);
  });

  it('falls back to the handle when the profile has no display name', async () => {
    mockProfile.value = { ...fullProfile, name: undefined };
    render(<UserMenu />);

    await waitFor(() =>
      expect(screen.getByLabelText('Account menu for spencerjireh')).toBeInTheDocument(),
    );
  });

  it('falls back to the icon when the profile has no avatar', async () => {
    mockProfile.value = { ...fullProfile, image: undefined };
    const { container } = render(<UserMenu />);

    await waitFor(() =>
      expect(screen.getByLabelText('Account menu for Spencer Jireh')).toBeInTheDocument(),
    );
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('shows the sign-in button when unauthenticated', async () => {
    mockAuthStatus.value = 'unauthenticated';
    mockProfile.value = null;
    render(<UserMenu />);

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /sign in with github/i })).toBeInTheDocument(),
    );
  });

  it('signs out through the POST helper rather than a navigation', async () => {
    const user = userEvent.setup();
    render(<UserMenu />);

    await user.click(await screen.findByLabelText('Account menu for Spencer Jireh'));
    await user.click(await screen.findByText('Sign out'));

    expect(mockSignOut).toHaveBeenCalledOnce();
  });
});
