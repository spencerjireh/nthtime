import { getSessionUserId, requireAuth, errorResponse, notFound, badRequest } from './api-helpers';

vi.mock('./auth', () => ({
  auth: vi.fn(),
}));

import { auth } from './auth';

const mockAuth = vi.mocked(auth);

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('getSessionUserId', () => {
  it('returns convexUserId when session is authenticated', async () => {
    mockAuth.mockResolvedValue({ convexUserId: 'user123' } as never);
    expect(await getSessionUserId()).toBe('user123');
  });

  it('returns null when session is null', async () => {
    mockAuth.mockResolvedValue(null as never);
    expect(await getSessionUserId()).toBeNull();
  });

  it('returns null when session has no convexUserId', async () => {
    mockAuth.mockResolvedValue({} as never);
    expect(await getSessionUserId()).toBeNull();
  });
});

describe('requireAuth', () => {
  it('returns [userId, null] when authenticated', async () => {
    mockAuth.mockResolvedValue({ convexUserId: 'user456' } as never);
    const [userId, err] = await requireAuth();
    expect(userId).toBe('user456');
    expect(err).toBeNull();
  });

  it('returns [null, 401 Response] when not authenticated', async () => {
    mockAuth.mockResolvedValue(null as never);
    const [userId, err] = await requireAuth();
    expect(userId).toBeNull();
    expect(err).not.toBeNull();

    const body = await err!.json();
    expect(body.error).toBe('Not authenticated');
    expect(err!.status).toBe(401);
  });
});

describe('error helpers', () => {
  it('errorResponse returns JSON with status', async () => {
    const res = errorResponse('Something broke', 500);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Something broke');
  });

  it('notFound defaults to 404', async () => {
    const res = notFound();
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('Not found');
  });

  it('badRequest defaults to 400', async () => {
    const res = badRequest();
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Bad request');
  });
});
