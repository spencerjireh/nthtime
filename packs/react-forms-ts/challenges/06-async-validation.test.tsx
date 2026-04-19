// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useEffect, useState, ChangeEvent } from 'react';

type CheckState = 'idle' | 'checking' | 'available' | 'taken';

function UsernameCheck({
  check,
}: {
  check: (name: string, signal: AbortSignal) => Promise<boolean>;
}) {
  const [name, setName] = useState<string>('');
  const [state, setState] = useState<CheckState>('idle');

  useEffect(() => {
    if (name.length < 3) {
      setState('idle');
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setState('checking');
      try {
        const ok = await check(name, controller.signal);
        if (!controller.signal.aborted) setState(ok ? 'available' : 'taken');
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [name, check]);

  return (
    <div>
      <input
        value={name}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
      />
      <p>{state}</p>
    </div>
  );
}

describe('06 Debounced Async Username Check', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('stays idle below 3 chars', () => {
    const check = vi.fn().mockResolvedValue(true);
    render(<UsernameCheck check={check} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ab' } });
    expect(screen.getByText('idle')).toBeDefined();
    expect(check).not.toHaveBeenCalled();
  });

  it('reports availability after debounce', async () => {
    const check = vi.fn().mockResolvedValue(true);
    render(<UsernameCheck check={check} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ada' } });
    await vi.advanceTimersByTimeAsync(300);
    expect(check).toHaveBeenCalledTimes(1);
    await vi.runAllTimersAsync();
    expect(screen.getByText('available')).toBeDefined();
  });

  it('debounces rapid keystrokes -- only the final value is checked', async () => {
    const check = vi.fn().mockResolvedValue(false);
    render(<UsernameCheck check={check} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'abc' } });
    fireEvent.change(input, { target: { value: 'abcd' } });
    fireEvent.change(input, { target: { value: 'abcde' } });
    await vi.advanceTimersByTimeAsync(300);
    expect(check).toHaveBeenCalledTimes(1);
    expect(check).toHaveBeenLastCalledWith('abcde', expect.any(AbortSignal));
    await vi.runAllTimersAsync();
    expect(screen.getByText('taken')).toBeDefined();
  });
});
