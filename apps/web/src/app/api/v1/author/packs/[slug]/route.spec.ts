/**
 * Tests for PATCH /api/v1/author/packs/[slug].
 *
 * Critical coverage:
 * - Auth gating (401 when unauthenticated)
 * - Property injection prevention (body cannot override packId)
 * - 404 when pack not found or not owned
 */
import { GET, PATCH, DELETE } from './route';

// -- Mocks ----------------------------------------------------------------

const mockGetBySlug = vi.fn();
const mockUpdatePack = vi.fn();
const mockRemovePack = vi.fn();

vi.mock('@/lib/data-access/repositories', () => ({
  authorRepository: {
    getBySlug: (...args: unknown[]) => mockGetBySlug(...args),
    updatePack: (...args: unknown[]) => mockUpdatePack(...args),
    removePack: (...args: unknown[]) => mockRemovePack(...args),
  },
}));

const mockAuth = vi.fn();
vi.mock('@/lib/auth', () => ({
  auth: () => mockAuth(),
}));

// -- Helpers --------------------------------------------------------------

function makeParams(slug: string) {
  return { params: Promise.resolve({ slug }) };
}

function makeRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/api/v1/author/packs/my-pack', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const PACK = {
  _id: 'pack-real-id',
  name: 'My Pack',
  slug: 'my-pack',
  description: 'desc',
  language: 'javascript',
  version: '1.0.0',
  tags: [],
  visibility: 'public',
  challenges: [],
};

beforeEach(() => {
  vi.restoreAllMocks();
  mockAuth.mockResolvedValue({ convexUserId: 'user1' });
  mockGetBySlug.mockResolvedValue(PACK);
  mockUpdatePack.mockResolvedValue(undefined);
  mockRemovePack.mockResolvedValue(undefined);
});

// -- Tests ----------------------------------------------------------------

describe('GET /api/v1/author/packs/[slug]', () => {
  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null);
    const res = await GET(new Request('http://localhost'), makeParams('my-pack'));
    expect(res.status).toBe(401);
  });

  it('returns 404 when pack not found', async () => {
    mockGetBySlug.mockResolvedValue(null);
    const res = await GET(new Request('http://localhost'), makeParams('nope'));
    expect(res.status).toBe(404);
  });

  it('returns pack data on success', async () => {
    const res = await GET(new Request('http://localhost'), makeParams('my-pack'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.slug).toBe('my-pack');
  });
});

describe('PATCH /api/v1/author/packs/[slug]', () => {
  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null);
    const res = await PATCH(makeRequest({ name: 'New' }), makeParams('my-pack'));
    expect(res.status).toBe(401);
  });

  it('returns 404 when pack not found', async () => {
    mockGetBySlug.mockResolvedValue(null);
    const res = await PATCH(makeRequest({ name: 'New' }), makeParams('my-pack'));
    expect(res.status).toBe(404);
  });

  it('passes only allowlisted fields to updatePack', async () => {
    const res = await PATCH(
      makeRequest({ name: 'Updated', description: 'new desc' }),
      makeParams('my-pack'),
    );
    expect(res.status).toBe(200);
    expect(mockUpdatePack).toHaveBeenCalledWith('user1', {
      packId: 'pack-real-id',
      name: 'Updated',
      slug: undefined,
      description: 'new desc',
      language: undefined,
      framework: undefined,
      version: undefined,
      tags: undefined,
      visibility: undefined,
    });
  });

  it('ignores injected packId in request body', async () => {
    await PATCH(
      makeRequest({ packId: 'injected-id', name: 'Hacked' }),
      makeParams('my-pack'),
    );
    // The packId passed to updatePack must be from the URL lookup, not the body
    const call = mockUpdatePack.mock.calls[0];
    expect(call[1].packId).toBe('pack-real-id');
  });

  it('ignores unknown properties in request body', async () => {
    await PATCH(
      makeRequest({ name: 'Ok', __proto__: { admin: true }, malicious: true }),
      makeParams('my-pack'),
    );
    const call = mockUpdatePack.mock.calls[0];
    expect(call[1]).not.toHaveProperty('malicious');
    expect(call[1]).not.toHaveProperty('admin');
  });
});

describe('DELETE /api/v1/author/packs/[slug]', () => {
  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null);
    const res = await DELETE(new Request('http://localhost'), makeParams('my-pack'));
    expect(res.status).toBe(401);
  });

  it('calls removePack with userId and packId', async () => {
    const res = await DELETE(new Request('http://localhost'), makeParams('my-pack'));
    expect(res.status).toBe(200);
    expect(mockRemovePack).toHaveBeenCalledWith('user1', 'pack-real-id');
  });
});
