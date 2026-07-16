import { describe, it, expect, vi, beforeEach } from 'vitest';

// Thin proxy: Spring Boot owns auth (401) and ownership enforcement -- see
// AuthorChallengeControllerIntegrationTest (ATHR-07/21). Here we pin the path mapping and, in
// particular, that the id path segment is URL-encoded before it reaches the upstream.
const proxyToSpringBoot = vi.fn(async () => new Response(null, { status: 200 }));

vi.mock('@/lib/spring-boot-proxy', () => ({
  proxyToSpringBoot: (...args: unknown[]) => proxyToSpringBoot(...args),
}));

import { GET, PATCH, DELETE } from './route';

function ctx(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  proxyToSpringBoot.mockClear();
});

// ATHR-21, ATHR-22
describe('/api/v1/author/challenges/[id] route', () => {
  it('forwards GET to the id-scoped upstream path', async () => {
    const req = new Request('http://localhost/api/v1/author/challenges/42');
    await GET(req, ctx('42'));
    expect(proxyToSpringBoot).toHaveBeenCalledWith(req, '/api/author/challenges/42');
  });

  it('forwards PATCH for the given id', async () => {
    const req = new Request('http://localhost/api/v1/author/challenges/42', { method: 'PATCH' });
    await PATCH(req, ctx('42'));
    expect(proxyToSpringBoot).toHaveBeenCalledWith(req, '/api/author/challenges/42');
  });

  it('forwards DELETE for the given id', async () => {
    const req = new Request('http://localhost/api/v1/author/challenges/42', { method: 'DELETE' });
    await DELETE(req, ctx('42'));
    expect(proxyToSpringBoot).toHaveBeenCalledWith(req, '/api/author/challenges/42');
  });

  it('URL-encodes the id path segment', async () => {
    const req = new Request('http://localhost/api/v1/author/challenges/a%2Fb');
    await GET(req, ctx('a/b'));
    expect(proxyToSpringBoot).toHaveBeenCalledWith(req, '/api/author/challenges/a%2Fb');
  });
});
