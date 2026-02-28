import { join } from 'node:path';
import request from 'supertest';
import { writeChallengeToTmp, importModule } from '../../test-helpers.js';

const CHALLENGE = join(import.meta.dirname, '02-route-params.json');

describe('02 Route Parameters', () => {
  let tmpDir: string;
  let cleanup: () => void;
  let app: Express.Application;

  beforeAll(async () => {
    ({ tmpDir, cleanup } = writeChallengeToTmp(CHALLENGE));
    const mod = await importModule<{ default: Express.Application }>(join(tmpDir, 'app.js'));
    app = mod.default;
  });

  afterAll(() => cleanup());

  it('GET /api/users/:id returns user with that id', async () => {
    const res = await request(app).get('/api/users/42');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('42');
    expect(res.body.name).toBe('User 42');
  });

  it('returns different data for different ids', async () => {
    const res = await request(app).get('/api/users/7');
    expect(res.body.id).toBe('7');
    expect(res.body.name).toBe('User 7');
  });
});
