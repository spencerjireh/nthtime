import { join } from 'node:path';
import request from 'supertest';
import { writeChallengeToTmp, importModule } from '../../test-helpers.js';

const CHALLENGE = join(import.meta.dirname, '10-full-rest-api.json');

describe('10 Full REST API', () => {
  let tmpDir: string;
  let cleanup: () => void;
  let app: Express.Application;

  beforeAll(async () => {
    ({ tmpDir, cleanup } = writeChallengeToTmp(CHALLENGE));
    const mod = await importModule<{ default: Express.Application }>(join(tmpDir, 'app.js'));
    app = mod.default;
  });

  afterAll(() => cleanup());

  it('POST /api/items creates an item with 201', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ name: 'Widget', price: 9.99 })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe('Widget');
  });

  it('GET /api/items returns created items', async () => {
    const res = await request(app).get('/api/items');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('PUT /api/items/:id updates an item', async () => {
    const create = await request(app)
      .post('/api/items')
      .send({ name: 'Gadget', price: 5.0 })
      .set('Content-Type', 'application/json');

    const id = create.body.id;
    const res = await request(app)
      .put(`/api/items/${id}`)
      .send({ name: 'Updated Gadget' })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Gadget');
  });

  it('DELETE /api/items/:id removes an item with 204', async () => {
    const create = await request(app)
      .post('/api/items')
      .send({ name: 'Temp' })
      .set('Content-Type', 'application/json');

    const id = create.body.id;
    const res = await request(app).delete(`/api/items/${id}`);
    expect(res.status).toBe(204);
  });

  it('PUT non-existent item returns 404', async () => {
    const res = await request(app)
      .put('/api/items/99999')
      .send({ name: 'Ghost' })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(404);
  });
});
