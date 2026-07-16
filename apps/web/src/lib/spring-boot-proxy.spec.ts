import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// cookies() is async in the app; the proxy only reads JSESSIONID / XSRF-TOKEN.
const cookieGet = vi.fn(() => undefined as { value: string } | undefined);
vi.mock('next/headers', () => ({
  cookies: async () => ({ get: cookieGet }),
}));

import { proxyToSpringBoot, SPRING_BOOT_URL } from './spring-boot-proxy';

let fetchMock: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  cookieGet.mockReturnValue(undefined);
  fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('ok', { status: 200 }));
});

afterEach(() => {
  fetchMock.mockRestore();
});

function fetchInit() {
  return fetchMock.mock.calls[0][1] as RequestInit;
}

describe('proxyToSpringBoot', () => {
  it('forwards a GET without a body to the upstream path + query', async () => {
    const req = new Request('http://localhost/api/v1/packs?q=react');
    const res = await proxyToSpringBoot(req, '/api/packs');

    expect(res.status).toBe(200);
    expect(fetchMock.mock.calls[0][0]).toBe(`${SPRING_BOOT_URL}/api/packs?q=react`);
    expect(fetchInit().method).toBe('GET');
    expect(fetchInit().body).toBeUndefined();
  });

  // Regression: HEAD used to fall through the `!== 'GET'` check and pass an empty-string body,
  // which undici rejects ("GET/HEAD method cannot have body") -> 500 on every HEAD.
  it('forwards a HEAD without a body (no 500)', async () => {
    const req = new Request('http://localhost/api/v1/packs', { method: 'HEAD' });
    const res = await proxyToSpringBoot(req, '/api/packs');

    expect(res.status).toBe(200);
    expect(fetchInit().method).toBe('HEAD');
    expect(fetchInit().body).toBeUndefined();
  });

  it('forwards a POST body verbatim', async () => {
    const req = new Request('http://localhost/api/v1/author/packs', {
      method: 'POST',
      body: JSON.stringify({ name: 'X' }),
      headers: { 'content-type': 'application/json' },
    });
    await proxyToSpringBoot(req, '/api/author/packs');

    expect(fetchInit().method).toBe('POST');
    expect(fetchInit().body).toBe(JSON.stringify({ name: 'X' }));
  });
});
