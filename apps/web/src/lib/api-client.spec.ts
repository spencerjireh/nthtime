import { fetchPacks, fetchChallenge, createAttempt, patchSettings } from './api-client';

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
