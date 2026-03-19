// @vitest-environment jsdom
import { render, screen, act } from '@testing-library/react';
import React, { useState, useEffect } from 'react';

// Inline reference solution with mocked fetch
function useFetch<T>(url: string): { data: T | null; loading: boolean; error: string | null } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [url]);

  return { data, loading, error };
}

function UserProfile() {
  const { data, loading, error } = useFetch<{ name: string }>('/api/user');

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  return <p>User: {data?.name}</p>;
}

function PostList() {
  const { data, loading, error } = useFetch<{ id: number; title: string }[]>('/api/posts');

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  return (
    <ul>
      {data?.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}

function App() {
  return (
    <div>
      <UserProfile />
      <PostList />
    </div>
  );
}

describe('08 Data Fetching with Hooks', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('shows loading initially', () => {
    globalThis.fetch = vi.fn(() => new Promise(() => {})) as unknown as typeof fetch;
    render(<App />);
    const loadingElements = screen.getAllByText('Loading...');
    expect(loadingElements.length).toBeGreaterThanOrEqual(2);
  });

  it('displays user data after fetch resolves', async () => {
    globalThis.fetch = vi.fn((url: string | URL | Request) => {
      const urlStr = typeof url === 'string' ? url : url.toString();
      if (urlStr === '/api/user') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ name: 'Alice', email: 'alice@test.com' }),
        });
      }
      if (urlStr === '/api/posts') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { id: 1, title: 'Post One' },
              { id: 2, title: 'Post Two' },
            ]),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    }) as unknown as typeof fetch;

    await act(async () => {
      render(<App />);
    });

    expect(screen.getByText('User: Alice')).toBeDefined();
  });

  it('displays posts after fetch resolves', async () => {
    globalThis.fetch = vi.fn((url: string | URL | Request) => {
      const urlStr = typeof url === 'string' ? url : url.toString();
      if (urlStr === '/api/user') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ name: 'Alice' }),
        });
      }
      if (urlStr === '/api/posts') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { id: 1, title: 'Post One' },
              { id: 2, title: 'Post Two' },
            ]),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    }) as unknown as typeof fetch;

    await act(async () => {
      render(<App />);
    });

    expect(screen.getByText('Post One')).toBeDefined();
    expect(screen.getByText('Post Two')).toBeDefined();
  });

  it('shows error message on fetch failure', async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      }),
    ) as unknown as typeof fetch;

    await act(async () => {
      render(<UserProfile />);
    });

    expect(screen.getByText(/Error:/)).toBeDefined();
  });
});
