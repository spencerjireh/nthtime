import { join } from 'node:path';
import request from 'supertest';
import { writeChallengeToTmp, importModule } from '../../test-helpers.js';

const CHALLENGE = join(import.meta.dirname, '09-multi-resource-api.json');

describe('09 Multi-resource API', () => {
  let tmpDir: string;
  let cleanup: () => void;
  let app: Express.Application;

  beforeAll(async () => {
    ({ tmpDir, cleanup } = writeChallengeToTmp(CHALLENGE));
    const mod = await importModule<{ default: Express.Application }>(join(tmpDir, 'app.js'));
    app = mod.default;
  });

  afterAll(() => cleanup());

  it('GET /api/users returns user list', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });

  it('GET /api/users/:id returns a specific user', async () => {
    const res = await request(app).get('/api/users/1');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Alice');
  });

  it('GET /api/users/:id returns 404 for missing user', async () => {
    const res = await request(app).get('/api/users/9999');
    expect(res.status).toBe(404);
  });

  it('POST /api/users creates a new user', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Charlie' })
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Charlie');
  });

  it('GET /api/posts returns post list', async () => {
    const res = await request(app).get('/api/posts');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/posts?userId=1 filters by userId', async () => {
    const res = await request(app).get('/api/posts?userId=1');
    expect(res.status).toBe(200);
    expect(res.body.every((p: { userId: number }) => p.userId === 1)).toBe(true);
  });

  it('POST /api/posts creates a new post', async () => {
    const res = await request(app)
      .post('/api/posts')
      .send({ title: 'New Post', userId: 1 })
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('New Post');
  });

  it('DELETE /api/posts/:id removes a post', async () => {
    const create = await request(app)
      .post('/api/posts')
      .send({ title: 'Temp', userId: 1 })
      .set('Content-Type', 'application/json');
    const id = create.body.id;
    const res = await request(app).delete(`/api/posts/${id}`);
    expect(res.status).toBe(204);
  });

  it('DELETE /api/posts/:id returns 404 for missing post', async () => {
    const res = await request(app).delete('/api/posts/99999');
    expect(res.status).toBe(404);
  });
});
