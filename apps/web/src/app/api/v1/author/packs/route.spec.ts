import { describe, it, expect, vi, beforeEach } from 'vitest';

// The author routes are thin proxies. Auth (401) and field allowlisting are enforced by Spring
// Boot -- see AuthorPackControllerIntegrationTest for that behavioral coverage (ATHR-21/22). These
// tests pin the proxy wiring: correct upstream path and verbatim request forwarding per method.
const proxyToSpringBoot = vi.fn(async () => new Response('ok', { status: 200 }));

vi.mock('@/lib/spring-boot-proxy', () => ({
  proxyToSpringBoot: (...args: unknown[]) => proxyToSpringBoot(...args),
}));

import { GET, POST } from './route';

beforeEach(() => {
  proxyToSpringBoot.mockClear();
});

// ATHR-21, ATHR-22
describe('/api/v1/author/packs route', () => {
  it('forwards GET to the Spring Boot author packs endpoint', async () => {
    const req = new Request('http://localhost/api/v1/author/packs');
    const res = await GET(req);

    expect(proxyToSpringBoot).toHaveBeenCalledWith(req, '/api/author/packs');
    expect(res.status).toBe(200);
  });

  it('forwards POST to the same endpoint without rewriting the body', async () => {
    const req = new Request('http://localhost/api/v1/author/packs', {
      method: 'POST',
      body: JSON.stringify({ name: 'X', slug: 'x', language: 'javascript' }),
      headers: { 'content-type': 'application/json' },
    });
    await POST(req);

    expect(proxyToSpringBoot).toHaveBeenCalledWith(req, '/api/author/packs');
  });
});
