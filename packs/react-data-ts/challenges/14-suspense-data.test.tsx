// @vitest-environment jsdom
import { render, screen, act } from '@testing-library/react';
import React, { Suspense, use, useMemo } from 'react';

type Profile = { id: number; name: string };

async function fetchProfile(id: number): Promise<Profile> {
  const r = await fetch(`/api/profile/${id}`);
  return r.json() as Promise<Profile>;
}

function ProfileView({ profilePromise }: { profilePromise: Promise<Profile> }) {
  const profile = use(profilePromise);
  return <p>{profile.name}</p>;
}

function Page({ id }: { id: number }) {
  const promise = useMemo(() => fetchProfile(id), [id]);
  return (
    <Suspense fallback={<p>loading</p>}>
      <ProfileView profilePromise={promise} />
    </Suspense>
  );
}

describe('14 use() + Suspense', () => {
  afterEach(() => vi.restoreAllMocks());

  it('shows fallback then suspended content', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ id: 3, name: 'Ada' }),
    } as unknown as Response);

    await act(async () => {
      render(<Page id={3} />);
    });
    expect(screen.getByText('Ada')).toBeDefined();
  });
});
