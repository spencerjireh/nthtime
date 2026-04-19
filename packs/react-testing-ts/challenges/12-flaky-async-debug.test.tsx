// @vitest-environment jsdom
import { render, screen, act } from '@testing-library/react';
import React, { useEffect, useState } from 'react';

function Banner({ ms }: { ms: number }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setReady(true), ms);
    return () => clearTimeout(id);
  }, [ms]);
  return ready ? <p>ready</p> : <p>waiting</p>;
}

describe('12 flaky async debug', () => {
  it('shows banner deterministically with fake timers', async () => {
    vi.useFakeTimers();
    render(<Banner ms={500} />);
    expect(screen.getByText('waiting')).toBeDefined();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    expect(screen.getByText('ready')).toBeDefined();
    vi.useRealTimers();
  });
});
