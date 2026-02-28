import { join } from 'node:path';
import request from 'supertest';
import { writeChallengeToTmp, importModule } from '../../test-helpers.js';

const CHALLENGE = join(import.meta.dirname, '03-post-json.json');

describe('03 POST JSON Handler', () => {
  let tmpDir: string;
  let cleanup: () => void;
  let app: Express.Application;

  beforeAll(async () => {
    ({ tmpDir, cleanup } = writeChallengeToTmp(CHALLENGE));
    const mod = await importModule<{ default: Express.Application }>(join(tmpDir, 'app.js'));
    app = mod.default;
  });

  afterAll(() => cleanup());

  it('POST /api/items accepts JSON body', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ name: 'Widget', price: 9.99 })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body.created).toBe(true);
    expect(res.body.item).toEqual({ name: 'Widget', price: 9.99 });
  });

  it('returns the full request body in item field', async () => {
    const body = { name: 'Gadget', category: 'electronics' };
    const res = await request(app)
      .post('/api/items')
      .send(body)
      .set('Content-Type', 'application/json');

    expect(res.body.item).toEqual(body);
  });
});
