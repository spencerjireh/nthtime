// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import React, { useEffect, useState } from 'react';

function createResourceHook<T>(loader: () => Promise<T>) {
  return function useResource() {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
      let cancelled = false;
      setLoading(true);
      loader()
        .then((result) => {
          if (cancelled) return;
          setData(result);
          setLoading(false);
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }, []);

    return { data, loading, error };
  };
}

const useUser = createResourceHook(async () => ({ id: 1, name: 'Ada' }));

function Profile() {
  const { data, loading, error } = useUser();
  if (loading) return <p>loading</p>;
  if (error) return <p>err: {error.message}</p>;
  return <p>hi {data?.name}</p>;
}

describe('12 Hook Factory', () => {
  it('returns a working hook tied to the resource', async () => {
    render(<Profile />);
    expect(screen.getByText('loading')).toBeDefined();
    await waitFor(() => expect(screen.getByText('hi Ada')).toBeDefined());
  });

  it('surfaces errors from the loader', async () => {
    const useBroken = createResourceHook(async () => {
      throw new Error('nope');
    });
    function Broken() {
      const { error, loading } = useBroken();
      if (loading) return <p>loading</p>;
      return <p>{error?.message}</p>;
    }
    render(<Broken />);
    await waitFor(() => expect(screen.getByText('nope')).toBeDefined());
  });
});
