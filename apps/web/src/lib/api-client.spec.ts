import {
  fetchPacks,
  fetchChallenge,
  createAttempt,
  patchSettings,
  fetchTracks,
  fetchTrack,
  createAuthorTrack,
  updateAuthorTrack,
  deleteAuthorTrack,
  reorderTrackPacks,
} from './api-client';

const BASE = '/api/v1';

beforeEach(() => {
  vi.restoreAllMocks();
});

function mockFetch(status: number, body: unknown) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 404 ? 'Not Found' : 'OK',
    json: () => Promise.resolve(body),
  } as Response);
}

describe('api-client request()', () => {
  it('returns parsed JSON on success', async () => {
    const payload = { packs: [], availableTags: [] };
    mockFetch(200, payload);
    const result = await fetchPacks();
    expect(result).toEqual(payload);
  });

  it('throws ApiError with server error message on failure', async () => {
    mockFetch(404, { error: 'Pack not found' });
    await expect(fetchChallenge('nonexistent')).rejects.toThrow('Pack not found');
  });

  it('throws ApiError with statusText when body has no error field', async () => {
    mockFetch(500, {});
    await expect(fetchPacks()).rejects.toThrow('OK');
  });

  it('throws ApiError with statusText when body is not JSON', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 502,
      statusText: 'Bad Gateway',
      json: () => Promise.reject(new Error('not json')),
    } as unknown as Response);
    await expect(fetchPacks()).rejects.toThrow('Bad Gateway');
  });

  it('sends Content-Type and JSON body for POST', async () => {
    const spy = mockFetch(201, { id: 'abc' });
    await createAttempt({
      challengeId: 'ch1',
      passed: true,
      assertionResults: [],
      hintsUsed: 0,
      timeSeconds: 42,
    });
    const [url, init] = spy.mock.calls[0];
    expect(url).toBe(`${BASE}/attempts`);
    expect(init?.method).toBe('POST');
    expect(init?.headers).toEqual(
      expect.objectContaining({ 'Content-Type': 'application/json' }),
    );
    const body = JSON.parse(init?.body as string);
    expect(body.challengeId).toBe('ch1');
    expect(body.passed).toBe(true);
  });

  it('sends PATCH with correct body for settings', async () => {
    const spy = mockFetch(200, { feedback: {}, keybindings: 'vim' });
    await patchSettings({ keybindings: 'vim' as never });
    const [url, init] = spy.mock.calls[0];
    expect(url).toBe(`${BASE}/settings`);
    expect(init?.method).toBe('PATCH');
    const body = JSON.parse(init?.body as string);
    expect(body.keybindings).toBe('vim');
  });

  it('builds query string for filters', async () => {
    const spy = mockFetch(200, { packs: [], availableTags: [] });
    await fetchPacks({ language: 'python', tags: ['web', 'api'] });
    const [url] = spy.mock.calls[0];
    expect(url).toContain('language=python');
    expect(url).toContain('tags=web%2Capi');
  });

  it('attaches X-XSRF-TOKEN header on POST when CSRF cookie exists', async () => {
    const cookieSpy = vi.spyOn(document, 'cookie', 'get').mockReturnValue('XSRF-TOKEN=abc123');
    const spy = mockFetch(201, { id: 'x' });
    await createAttempt({
      challengeId: 'ch1',
      passed: true,
      assertionResults: [],
      hintsUsed: 0,
      timeSeconds: 10,
    });
    const [, init] = spy.mock.calls[0];
    expect(init?.headers).toEqual(
      expect.objectContaining({ 'X-XSRF-TOKEN': 'abc123' }),
    );
    cookieSpy.mockRestore();
  });

  it('does not attach X-XSRF-TOKEN header on GET requests', async () => {
    const cookieSpy = vi.spyOn(document, 'cookie', 'get').mockReturnValue('XSRF-TOKEN=abc123');
    const spy = mockFetch(200, { packs: [], availableTags: [] });
    await fetchPacks();
    const [, init] = spy.mock.calls[0];
    expect(init?.headers).not.toHaveProperty('X-XSRF-TOKEN');
    cookieSpy.mockRestore();
  });

  it('URL-decodes the CSRF token value', async () => {
    const cookieSpy = vi
      .spyOn(document, 'cookie', 'get')
      .mockReturnValue('XSRF-TOKEN=a%3Db%26c');
    const spy = mockFetch(200, { feedback: {}, keybindings: 'default' });
    await patchSettings({ keybindings: 'default' as never });
    const [, init] = spy.mock.calls[0];
    expect(init?.headers).toEqual(
      expect.objectContaining({ 'X-XSRF-TOKEN': 'a=b&c' }),
    );
    cookieSpy.mockRestore();
  });
});

describe('track endpoints', () => {
  it('fetchTracks sends GET to /tracks', async () => {
    const spy = mockFetch(200, [
      {
        _id: '1',
        slug: 'python-curriculum',
        title: 'Python',
        description: '',
        tags: [],
        packCount: 5,
        totalChallenges: 50,
        passedChallenges: 10,
      },
    ]);
    const result = await fetchTracks();
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('python-curriculum');
    const [url] = spy.mock.calls[0];
    expect(url).toBe(`${BASE}/tracks`);
  });

  it('fetchTrack sends GET to /tracks/:slug', async () => {
    const spy = mockFetch(200, {
      _id: '1',
      slug: 'python-curriculum',
      title: 'Python',
      description: '',
      longDescription: '## Hello',
      tags: [],
      packs: [],
    });
    const result = await fetchTrack('python-curriculum');
    expect(result.slug).toBe('python-curriculum');
    const [url] = spy.mock.calls[0];
    expect(url).toBe(`${BASE}/tracks/python-curriculum`);
  });

  it('createAuthorTrack sends POST with JSON body', async () => {
    const spy = mockFetch(201, { id: 't1' });
    const result = await createAuthorTrack({
      slug: 'my-track',
      title: 'My Track',
      description: 'desc',
      tags: ['python'],
      packSlugs: ['python-foundations'],
    });
    expect(result.id).toBe('t1');
    const [url, init] = spy.mock.calls[0];
    expect(url).toBe(`${BASE}/author/tracks`);
    expect(init?.method).toBe('POST');
    const body = JSON.parse(init?.body as string);
    expect(body.slug).toBe('my-track');
    expect(body.packSlugs).toEqual(['python-foundations']);
  });

  it('updateAuthorTrack sends PATCH to /author/tracks/:slug', async () => {
    const spy = mockFetch(200, undefined);
    await updateAuthorTrack('my-track', { title: 'Updated' });
    const [url, init] = spy.mock.calls[0];
    expect(url).toBe(`${BASE}/author/tracks/my-track`);
    expect(init?.method).toBe('PATCH');
    const body = JSON.parse(init?.body as string);
    expect(body.title).toBe('Updated');
  });

  it('deleteAuthorTrack sends DELETE to /author/tracks/:slug', async () => {
    const spy = mockFetch(200, undefined);
    await deleteAuthorTrack('my-track');
    const [url, init] = spy.mock.calls[0];
    expect(url).toBe(`${BASE}/author/tracks/my-track`);
    expect(init?.method).toBe('DELETE');
  });

  it('reorderTrackPacks sends PUT with packSlugs', async () => {
    const spy = mockFetch(200, undefined);
    await reorderTrackPacks('my-track', ['pack-b', 'pack-a']);
    const [url, init] = spy.mock.calls[0];
    expect(url).toBe(`${BASE}/author/tracks/my-track/packs/order`);
    expect(init?.method).toBe('PUT');
    const body = JSON.parse(init?.body as string);
    expect(body.packSlugs).toEqual(['pack-b', 'pack-a']);
  });

  it('fetchTrack throws on 404', async () => {
    mockFetch(404, { error: 'Track not found' });
    await expect(fetchTrack('bad-slug')).rejects.toThrow('Track not found');
  });
});
