// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { z } from 'zod';
import React, { useEffect, useState } from 'react';

const ProfileSchema = z.object({ id: z.number(), name: z.string() });
type Profile = z.infer<typeof ProfileSchema>;

function ProfileView() {
  const [profile, setProfile] = useState<Profile | null>(null);
  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((raw) => setProfile(ProfileSchema.parse(raw)));
  }, []);
  if (!profile) return <p>loading</p>;
  return <p>{profile.name}</p>;
}

const server = setupServer(
  http.get('/api/profile', () => HttpResponse.json<Profile>({ id: 1, name: 'Ada' })),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('11 typed MSW handlers via Zod', () => {
  it('serves a payload that satisfies the Zod schema', async () => {
    render(<ProfileView />);
    expect(await screen.findByText('Ada')).toBeDefined();
  });
});
