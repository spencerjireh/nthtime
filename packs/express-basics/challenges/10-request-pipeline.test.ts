import { join } from 'node:path';
import request from 'supertest';
import { writeChallengeToTmp, importModule } from '../../test-helpers.js';

const CHALLENGE = join(import.meta.dirname, '10-request-pipeline.json');

describe('10 Request Pipeline', () => {
  let tmpDir: string;
  let cleanup: () => void;
  let app: Express.Application;

  beforeAll(async () => {
    ({ tmpDir, cleanup } = writeChallengeToTmp(CHALLENGE));
    const mod = await importModule<{ default: Express.Application }>(join(tmpDir, 'app.js'));
    app = mod.default;
  });

  afterAll(() => cleanup());

  it('GET /api/items returns wrapped response with success and data', async () => {
    const res = await request(app).get('/api/items');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/items uses default pagination (page 1, limit 10)', async () => {
    const res = await request(app).get('/api/items');
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data.length).toBeLessThanOrEqual(10);
  });

  it('GET /api/items?page=1&limit=2 returns 2 items', async () => {
    const res = await request(app).get('/api/items?page=1&limit=2');
    expect(res.body.data.length).toBe(2);
  });

  it('GET /api/items?page=2&limit=2 returns next page', async () => {
    const page1 = await request(app).get('/api/items?page=1&limit=2');
    const page2 = await request(app).get('/api/items?page=2&limit=2');
    expect(page2.body.data[0].id).not.toBe(page1.body.data[0].id);
  });

  it('POST /api/items with missing field returns 400', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ name: 'Widget' })
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Missing field/);
  });

  it('POST /api/items with all fields returns 201 wrapped response', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ name: 'NewItem', price: 5.99 })
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('NewItem');
  });
});
