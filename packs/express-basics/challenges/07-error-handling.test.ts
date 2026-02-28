import { join } from 'node:path';
import request from 'supertest';
import { writeChallengeToTmp, importModule } from '../../test-helpers.js';

const CHALLENGE = join(import.meta.dirname, '07-error-handling.json');

describe('07 Error Handling Middleware', () => {
  let tmpDir: string;
  let cleanup: () => void;
  let app: Express.Application;

  beforeAll(async () => {
    ({ tmpDir, cleanup } = writeChallengeToTmp(CHALLENGE));
    const mod = await importModule<{ default: Express.Application }>(join(tmpDir, 'app.js'));
    app = mod.default;
  });

  afterAll(() => cleanup());

  it('GET /api/error returns 500', async () => {
    const res = await request(app).get('/api/error');
    expect(res.status).toBe(500);
  });

  it('error response contains JSON error body', async () => {
    const res = await request(app).get('/api/error');
    expect(res.body.error).toBeDefined();
    expect(typeof res.body.error).toBe('string');
  });
});
