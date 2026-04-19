// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import React, { useState } from 'react';

type Hit = { id: number; name: string };
type User = { id: number; name: string; bio: string };

function App() {
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [detail, setDetail] = useState<User | null>(null);

  const onChange = async (next: string) => {
    setQ(next);
    if (next.length === 0) {
      setHits([]);
      return;
    }
    const r = await fetch('/api/search?q=' + encodeURIComponent(next));
    setHits(await r.json());
  };

  const open = async (id: number) => {
    const r = await fetch('/api/users/' + id);
    setDetail(await r.json());
  };

  return (
    <main>
      <label htmlFor="search">search</label>
      <input id="search" value={q} onChange={(e) => onChange(e.target.value)} />
      <ul>
        {hits.map((h) => (
          <li key={h.id}>
            <button onClick={() => open(h.id)}>{h.name}</button>
          </li>
        ))}
      </ul>
      {detail ? (
        <article>
          <h2>{detail.name}</h2>
          <p>{detail.bio}</p>
        </article>
      ) : null}
    </main>
  );
}

const server = setupServer(
  http.get('/api/search', () => HttpResponse.json([{ id: 1, name: 'Ada' }])),
  http.get('/api/users/1', () => HttpResponse.json({ id: 1, name: 'Ada', bio: 'pioneer' })),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('09 integration flow', () => {
  it('search -> list -> detail', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText('search'), 'a');
    await user.click(await screen.findByRole('button', { name: 'Ada' }));
    expect(await screen.findByText('pioneer')).toBeDefined();
  });
});
