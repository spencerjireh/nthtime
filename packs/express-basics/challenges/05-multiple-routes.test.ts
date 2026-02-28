import { join } from 'node:path';
import request from 'supertest';
import { writeChallengeToTmp, importModule } from '../../test-helpers.js';

const CHALLENGE = join(import.meta.dirname, '05-multiple-routes.json');

describe('05 Multiple Routes', () => {
  let tmpDir: string;
  let cleanup: () => void;
  let app: Express.Application;

  beforeAll(async () => {
    ({ tmpDir, cleanup } = writeChallengeToTmp(CHALLENGE));
    const mod = await importModule<{ default: Express.Application }>(join(tmpDir, 'app.js'));
    app = mod.default;
  });

  afterAll(() => cleanup());

  it('GET /api/items returns an array', async () => {
    const res = await request(app).get('/api/items');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/items returns 201 with generated id', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ name: 'Widget' })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe('Widget');
  });

  it('POST then GET shows the created item', async () => {
    await request(app)
      .post('/api/items')
      .send({ name: 'Gadget' })
      .set('Content-Type', 'application/json');

    const res = await request(app).get('/api/items');
    const names = res.body.map((item: { name: string }) => item.name);
    expect(names).toContain('Gadget');
  });
});
