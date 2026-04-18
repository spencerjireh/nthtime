// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import React, { useEffect, useState } from 'react';

type FetchState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

function useFetch<T>(url: string): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({ status: 'idle' });

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading' });

    fetch(url, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = (await response.json()) as T;
        setState({ status: 'success', data });
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') return;
        setState({
          status: 'error',
          error: err instanceof Error ? err : new Error(String(err)),
        });
      });

    return () => controller.abort();
  }, [url]);

  return state;
}

function Probe({ url }: { url: string }) {
  const state = useFetch<{ ok: boolean }>(url);
  if (state.status === 'loading' || state.status === 'idle') return <p>loading</p>;
  if (state.status === 'error') return <p>error: {state.error.message}</p>;
  return <p>ok: {String(state.data.ok)}</p>;
}

describe('08 useFetch', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    } as unknown as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads data successfully', async () => {
    render(<Probe url="/api/thing" />);
    expect(screen.getByText('loading')).toBeDefined();
    await waitFor(() => expect(screen.getByText('ok: true')).toBeDefined());
  });

  it('surfaces HTTP errors', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 } as Response);
    render(<Probe url="/api/nope" />);
    await waitFor(() => expect(screen.getByText(/error: HTTP 500/)).toBeDefined());
  });
});
