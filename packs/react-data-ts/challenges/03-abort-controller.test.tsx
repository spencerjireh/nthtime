// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import React, { useEffect, useState } from 'react';

type Item = { id: number; name: string };

function Items({ url }: { url: string }) {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(url, { signal: controller.signal })
      .then((r) => r.json() as Promise<Item[]>)
      .then((data) => setItems(data))
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') return;
        throw err;
      });

    return () => controller.abort();
  }, [url]);

  return (
    <ul>
      {items.map((i) => (
        <li key={i.id}>{i.name}</li>
      ))}
    </ul>
  );
}

describe('03 AbortController', () => {
  it('passes the signal to fetch and aborts on unmount', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => [{ id: 1, name: 'apple' }],
    } as unknown as Response);
    globalThis.fetch = fetchMock;

    const { unmount } = render(<Items url="/api/items" />);
    await waitFor(() => expect(screen.getByText('apple')).toBeDefined());

    const passed = fetchMock.mock.calls[0][1] as { signal: AbortSignal };
    expect(passed.signal).toBeInstanceOf(AbortSignal);
    expect(passed.signal.aborted).toBe(false);

    unmount();
    expect(passed.signal.aborted).toBe(true);

    vi.restoreAllMocks();
  });
});
