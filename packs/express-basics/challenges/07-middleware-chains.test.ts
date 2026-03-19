import { join } from 'node:path';
import request from 'supertest';
import { writeChallengeToTmp, importModule } from '../../test-helpers.js';

const CHALLENGE = join(import.meta.dirname, '07-middleware-chains.json');

describe('07 Middleware Chains', () => {
  let tmpDir: string;
  let cleanup: () => void;
  let app: Express.Application;

  beforeAll(async () => {
    ({ tmpDir, cleanup } = writeChallengeToTmp(CHALLENGE));
    const mod = await importModule<{ default: Express.Application }>(join(tmpDir, 'app.js'));
    app = mod.default;
  });

  afterAll(() => cleanup());

  it('rejects requests without auth header with 401', async () => {
    const res = await request(app).get('/api/status');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('allows requests with valid auth header', async () => {
    const res = await request(app)
      .get('/api/status')
      .set('Authorization', 'Bearer secret');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('POST without name returns 400', async () => {
    const res = await request(app)
      .post('/api/items')
      .set('Authorization', 'Bearer secret')
      .send({ price: 10 })
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Name required');
  });

  it('POST with valid auth and name returns 201', async () => {
    const res = await request(app)
      .post('/api/items')
      .set('Authorization', 'Bearer secret')
      .send({ name: 'Widget' })
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(201);
    expect(res.body.created).toBe(true);
    expect(res.body.item.name).toBe('Widget');
  });

  it('auth runs before validate on POST', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ name: 'Widget' })
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(401);
  });
});
