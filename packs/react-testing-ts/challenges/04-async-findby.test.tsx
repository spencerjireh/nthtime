// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import React, { useEffect, useState } from 'react';

function User({ id }: { id: number }) {
  const [name, setName] = useState<string | null>(null);
  useEffect(() => {
    fetch(`/api/users/${id}`)
      .then((r) => r.json())
      .then((u: { name: string }) => setName(u.name));
  }, [id]);
  if (!name) return <p>loading</p>;
  return <p>{name}</p>;
}

describe('04 async findBy', () => {
  afterEach(() => vi.restoreAllMocks());

  it('shows loaded user after fetch resolves', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ name: 'Ada' }),
    } as unknown as Response);

    render(<User id={1} />);
    expect(screen.getByText('loading')).toBeDefined();
    expect(await screen.findByText('Ada')).toBeDefined();
  });
});
