import { join } from 'node:path';
import request from 'supertest';
import { writeChallengeToTmp, importModule } from '../../test-helpers.js';

const CHALLENGE = join(import.meta.dirname, '08-async-error-handling.json');

describe('08 Async Error Handling', () => {
  let tmpDir: string;
  let cleanup: () => void;
  let app: Express.Application;

  beforeAll(async () => {
    ({ tmpDir, cleanup } = writeChallengeToTmp(CHALLENGE));
    const mod = await importModule<{ default: Express.Application }>(join(tmpDir, 'app.js'));
    app = mod.default;
  });

  afterAll(() => cleanup());

  it('GET /api/items/:id returns 404 with error message', async () => {
    const res = await request(app).get('/api/items/123');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Item not found');
  });

  it('GET /api/status returns 200', async () => {
    const res = await request(app).get('/api/status');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('error handler returns JSON content type', async () => {
    const res = await request(app).get('/api/items/999');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('NotFoundError uses statusCode 404', async () => {
    const res = await request(app).get('/api/items/abc');
    expect(res.status).toBe(404);
  });
});
