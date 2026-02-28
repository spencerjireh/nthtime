import { join } from 'node:path';
import request from 'supertest';
import { writeChallengeToTmp, importModule } from '../../test-helpers.js';

const CHALLENGE = join(import.meta.dirname, '04-query-filtering.json');

describe('04 Query String Filtering', () => {
  let tmpDir: string;
  let cleanup: () => void;
  let app: Express.Application;

  beforeAll(async () => {
    ({ tmpDir, cleanup } = writeChallengeToTmp(CHALLENGE));
    const mod = await importModule<{ default: Express.Application }>(join(tmpDir, 'app.js'));
    app = mod.default;
  });

  afterAll(() => cleanup());

  it('GET /api/items returns all items when no filter', async () => {
    const res = await request(app).get('/api/items');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
  });

  it('GET /api/items?category=tools returns only tools', async () => {
    const res = await request(app).get('/api/items?category=tools');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body.every((item: { category: string }) => item.category === 'tools')).toBe(true);
  });

  it('GET /api/items?category=electronics returns only electronics', async () => {
    const res = await request(app).get('/api/items?category=electronics');
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Gadget');
  });
});
