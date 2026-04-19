// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

type User = { id: number; name: string };
type Post = { id: number; userId: number; title: string };

async function fetchUser(): Promise<User> {
  const r = await fetch('/api/me');
  return r.json() as Promise<User>;
}

async function fetchPosts(userId: number): Promise<Post[]> {
  const r = await fetch(`/api/users/${userId}/posts`);
  return r.json() as Promise<Post[]>;
}

function UserPosts() {
  const userQuery = useQuery({ queryKey: ['me'], queryFn: fetchUser });
  const userId = userQuery.data?.id;

  const postsQuery = useQuery({
    queryKey: ['posts', userId],
    queryFn: () => fetchPosts(userId!),
    enabled: !!userId,
  });

  if (userQuery.isLoading) return <p>loading user</p>;

  return (
    <div>
      <h2>{userQuery.data?.name}</h2>
      {postsQuery.isLoading ? (
        <p>loading posts</p>
      ) : (
        <ul>
          {postsQuery.data?.map((p) => (
            <li key={p.id}>{p.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

describe('11 Dependent Queries', () => {
  afterEach(() => vi.restoreAllMocks());

  it('fetches posts only after the user resolves', async () => {
    const calls: string[] = [];
    globalThis.fetch = vi.fn(async (url: RequestInfo | URL) => {
      const u = String(url);
      calls.push(u);
      if (u === '/api/me') return { json: async () => ({ id: 7, name: 'Ada' }) } as unknown as Response;
      return { json: async () => [{ id: 1, userId: 7, title: 'hello' }] } as unknown as Response;
    });

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <UserPosts />
      </QueryClientProvider>,
    );

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Ada' })).toBeDefined());
    await waitFor(() => expect(screen.getByText('hello')).toBeDefined());

    expect(calls[0]).toBe('/api/me');
    expect(calls).toContain('/api/users/7/posts');
  });
});
