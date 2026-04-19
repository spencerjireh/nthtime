// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React, { useState, useTransition, ChangeEvent } from 'react';

type Row = { id: number; label: string };

function LiveFilter({ rows }: { rows: Row[] }) {
  const [query, setQuery] = useState<string>('');
  const [deferredQuery, setDeferredQuery] = useState<string>('');
  const [isPending, startTransition] = useTransition();

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setQuery(next);
    startTransition(() => {
      setDeferredQuery(next);
    });
  };

  const visible = rows.filter((r) => r.label.includes(deferredQuery));

  return (
    <div>
      <input value={query} onChange={onChange} />
      <p>{isPending ? 'updating...' : 'idle'}</p>
      <ul>
        {visible.map((r) => (
          <li key={r.id}>{r.label}</li>
        ))}
      </ul>
    </div>
  );
}

describe('10 startTransition', () => {
  it('keeps the input value urgent while filter updates as a transition', async () => {
    const rows: Row[] = [
      { id: 1, label: 'apple' },
      { id: 2, label: 'banana' },
      { id: 3, label: 'avocado' },
    ];

    render(<LiveFilter rows={rows} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'av' } });
    expect(input.value).toBe('av');

    await waitFor(() => {
      expect(screen.queryByText('apple')).toBeNull();
      expect(screen.queryByText('banana')).toBeNull();
      expect(screen.getByText('avocado')).toBeDefined();
    });
  });
});
