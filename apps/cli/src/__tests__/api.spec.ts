import { fetchChallenge, fetchPack, ApiError } from '../api.js';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function mockFetch(response: { status: number; body: unknown }) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: response.status >= 200 && response.status < 300,
    status: response.status,
    json: () => Promise.resolve(response.body),
    text: () => Promise.resolve(JSON.stringify(response.body)),
  });
}

describe('fetchChallenge', () => {
  it('returns challenge data on success', async () => {
    const mockData = {
      title: 'Hello World',
      slug: 'hello-world',
      prompt: 'Create a server',
      difficulty: 'beginner',
      expectedFiles: ['index.js'],
      assertions: { perFile: {}, crossFile: [] },
      hints: [],
      webUrl: '/challenge/123',
    };
    mockFetch({ status: 200, body: mockData });

    const result = await fetchChallenge('http://localhost:3000', 'express-basics', 'hello-world');
    expect(result.title).toBe('Hello World');
    expect(result.expectedFiles).toHaveLength(1);
  });

  it('throws ApiError on 404', async () => {
    mockFetch({ status: 404, body: { error: 'not found' } });

    await expect(
      fetchChallenge('http://localhost:3000', 'bad', 'slug'),
    ).rejects.toThrow(ApiError);
  });

  it('encodes slugs in URL', async () => {
    mockFetch({ status: 200, body: {} });

    await fetchChallenge('http://localhost:3000', 'my pack', 'my challenge');
    const calledUrl = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(calledUrl).toContain('my%20pack');
    expect(calledUrl).toContain('my%20challenge');
  });
});

describe('fetchPack', () => {
  it('returns pack data on success', async () => {
    const mockData = {
      name: 'Express Basics',
      slug: 'express-basics',
      language: 'javascript',
      challenges: [{ title: 'Hello World', slug: 'hello-world', order: 0, difficulty: 'beginner' }],
    };
    mockFetch({ status: 200, body: mockData });

    const result = await fetchPack('http://localhost:3000', 'express-basics');
    expect(result.name).toBe('Express Basics');
    expect(result.challenges).toHaveLength(1);
  });

  it('throws ApiError on 404', async () => {
    mockFetch({ status: 404, body: { error: 'not found' } });

    await expect(fetchPack('http://localhost:3000', 'bad')).rejects.toThrow(ApiError);
  });
});
