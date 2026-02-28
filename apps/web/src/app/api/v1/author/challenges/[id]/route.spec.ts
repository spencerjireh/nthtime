/**
 * Tests for /api/v1/author/challenges/[id].
 *
 * Critical coverage:
 * - Auth gating
 * - Property injection prevention (body cannot override challengeId)
 * - Only allowlisted fields passed to repository
 */
import { PATCH, DELETE } from './route';

const mockGetChallenge = vi.fn();
const mockUpdateChallenge = vi.fn();
const mockRemoveChallenge = vi.fn();

vi.mock('@/lib/data-access/repositories', () => ({
  authorRepository: {
    getChallenge: (...args: unknown[]) => mockGetChallenge(...args),
    updateChallenge: (...args: unknown[]) => mockUpdateChallenge(...args),
    removeChallenge: (...args: unknown[]) => mockRemoveChallenge(...args),
  },
}));

const mockAuth = vi.fn();
vi.mock('@/lib/auth', () => ({
  auth: () => mockAuth(),
}));

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

function makePatchRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/api/v1/author/challenges/ch1', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const CHALLENGE = {
  _id: 'ch-real-id',
  packId: 'pack1',
  slug: 'my-challenge',
  title: 'Test',
  prompt: 'Do the thing',
  difficulty: 'beginner',
  tags: [],
  timeEstimateSeconds: 300,
  scaffolded: false,
  files: [],
  hints: [],
  assertions: { perFile: {}, crossFile: [] },
  order: 1,
};

beforeEach(() => {
  vi.restoreAllMocks();
  mockAuth.mockResolvedValue({ convexUserId: 'user1' });
  mockGetChallenge.mockResolvedValue(CHALLENGE);
  mockUpdateChallenge.mockResolvedValue(undefined);
  mockRemoveChallenge.mockResolvedValue(undefined);
});

describe('PATCH /api/v1/author/challenges/[id]', () => {
  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null);
    const res = await PATCH(makePatchRequest({ title: 'New' }), makeParams('ch1'));
    expect(res.status).toBe(401);
  });

  it('passes only allowlisted fields to updateChallenge', async () => {
    await PATCH(makePatchRequest({ title: 'Updated', difficulty: 'advanced' }), makeParams('ch1'));
    const call = mockUpdateChallenge.mock.calls[0];
    expect(call[0]).toBe('user1');
    expect(call[1]).toEqual({
      challengeId: 'ch1',
      title: 'Updated',
      difficulty: 'advanced',
      slug: undefined,
      prompt: undefined,
      tags: undefined,
      timeEstimateSeconds: undefined,
      scaffolded: undefined,
      files: undefined,
      hints: undefined,
      assertions: undefined,
      referenceSolution: undefined,
    });
  });

  it('ignores injected challengeId in request body', async () => {
    await PATCH(
      makePatchRequest({ challengeId: 'injected', title: 'Hacked' }),
      makeParams('ch1'),
    );
    const call = mockUpdateChallenge.mock.calls[0];
    expect(call[1].challengeId).toBe('ch1');
  });

  it('ignores unknown properties like packId or userId', async () => {
    await PATCH(
      makePatchRequest({ packId: 'hijack', userId: 'hijack', title: 'Ok' }),
      makeParams('ch1'),
    );
    const call = mockUpdateChallenge.mock.calls[0];
    expect(call[1]).not.toHaveProperty('packId');
    expect(call[1]).not.toHaveProperty('userId');
  });
});

describe('DELETE /api/v1/author/challenges/[id]', () => {
  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null);
    const res = await DELETE(new Request('http://localhost'), makeParams('ch1'));
    expect(res.status).toBe(401);
  });

  it('calls removeChallenge with correct args', async () => {
    const res = await DELETE(new Request('http://localhost'), makeParams('ch1'));
    expect(res.status).toBe(200);
    expect(mockRemoveChallenge).toHaveBeenCalledWith('user1', 'ch1');
  });
});
