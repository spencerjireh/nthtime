// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import React, { useEffect, useState } from 'react';
import { z } from 'zod';

const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

type User = z.infer<typeof userSchema>;

async function fetchUser(url: string): Promise<User> {
  const res = await fetch(url);
  const json = await res.json();
  return userSchema.parse(json);
}

function UserCard({ url }: { url: string }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchUser(url).then((u) => {
      if (!cancelled) setUser(u);
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (!user) return <p>loading</p>;
  return <p>{user.name}</p>;
}

describe('04 Typed Response with Zod', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('parses + renders a valid response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ id: 1, name: 'Ada', email: 'ada@x.io' }),
    } as unknown as Response);

    render(<UserCard url="/api/me" />);
    await waitFor(() => expect(screen.getByText('Ada')).toBeDefined());
  });

  it('throws on shape mismatch', async () => {
    await expect(
      (async () => {
        const bad = userSchema.safeParse({ id: 'not-a-number', name: 'x', email: 'x' });
        if (!bad.success) throw bad.error;
      })(),
    ).rejects.toThrow();
  });
});
