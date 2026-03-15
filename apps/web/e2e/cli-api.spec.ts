import { test, expect } from '@playwright/test';

test.describe('CLI API endpoints', () => {
  test('GET /api/cli/pack/express-basics returns pack data', async ({ request }) => {
    const res = await request.get('/api/cli/pack/express-basics');
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body).toHaveProperty('slug', 'express-basics');
    expect(body).toHaveProperty('title');
    expect(body).toHaveProperty('challenges');
    expect(Array.isArray(body.challenges)).toBe(true);
    expect(body.challenges.length).toBeGreaterThan(0);
  });

  test('GET /api/cli/challenge/express-basics/hello-world-server returns challenge', async ({
    request,
  }) => {
    const res = await request.get('/api/cli/challenge/express-basics/hello-world-server');
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body).toHaveProperty('slug', 'hello-world-server');
    expect(body).toHaveProperty('title');
    expect(body).toHaveProperty('assertions');
    expect(Array.isArray(body.assertions)).toBe(true);
  });

  test('GET /api/cli/pack/nonexistent returns 404', async ({ request }) => {
    const res = await request.get('/api/cli/pack/nonexistent-pack-slug');
    expect(res.ok()).toBe(false);
    expect(res.status()).toBe(404);
  });
});
