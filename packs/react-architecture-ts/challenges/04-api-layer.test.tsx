// @vitest-environment jsdom

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function apiGet<T>(url: string): Promise<T> {
  const r = await fetch(url, { headers: { 'content-type': 'application/json' } });
  if (!r.ok) throw new ApiError(r.status, r.statusText);
  return (await r.json()) as T;
}

async function apiPost<TReq, TRes>(url: string, body: TReq): Promise<TRes> {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new ApiError(r.status, r.statusText);
  return (await r.json()) as TRes;
}

describe('04 typed API layer', () => {
  afterEach(() => vi.restoreAllMocks());

  it('apiGet parses JSON', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1 }),
    } as unknown as Response);
    const r = await apiGet<{ id: number }>('/api/x');
    expect(r.id).toBe(1);
  });

  it('apiGet throws ApiError on !ok', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'oops',
    } as Response);
    await expect(apiGet('/api/x')).rejects.toBeInstanceOf(ApiError);
  });

  it('apiPost sends body and returns typed result', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    } as unknown as Response);
    globalThis.fetch = fetchMock;
    const r = await apiPost<{ x: number }, { ok: boolean }>('/api/x', { x: 1 });
    expect(r.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/x',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ x: 1 }) }),
    );
  });
});
