// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import React, { useEffect, useState } from 'react';

type Post = { id: number; title: string };

function PostList({ url }: { url: string }) {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch(url)
      .then((r) => r.json() as Promise<Post[]>)
      .then((data) => {
        if (!cancelled) setPosts(data);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <ul>
      {posts.map((p) => (
        <li key={p.id}>{p.title}</li>
      ))}
    </ul>
  );
}

describe('01 Fetch on Mount', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: async () => [
        { id: 1, title: 'first' },
        { id: 2, title: 'second' },
      ],
    } as unknown as Response);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders fetched titles', async () => {
    render(<PostList url="/api/posts" />);
    await waitFor(() => {
      expect(screen.getByText('first')).toBeDefined();
      expect(screen.getByText('second')).toBeDefined();
    });
  });
});
