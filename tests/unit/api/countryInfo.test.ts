/**
 * The serverless proxy is a trust boundary: it holds the RestCountries API key
 * and fronts a metered upstream, so it validates before spending a request and
 * never forwards upstream auth failures to the client.
 */
export {};

const handler = require('../../../api/country-info.js');

type MockRes = {
  statusCode: number;
  body: any;
  headers: Record<string, string>;
  status: jest.Mock;
  json: jest.Mock;
  setHeader: jest.Mock;
};

const makeRes = (): MockRes => {
  const res: Partial<MockRes> = { statusCode: 0, body: undefined, headers: {} };
  res.status = jest.fn(code => { res.statusCode = code; return res; });
  res.json = jest.fn(body => { res.body = body; return res; });
  res.setHeader = jest.fn((k, v) => { (res.headers as Record<string, string>)[k] = v; });
  return res as MockRes;
};

const call = async (query: any) => {
  const res = makeRes();
  await handler({ query }, res);
  return res;
};

describe('api/country-info', () => {
  const originalKey = process.env.REST_COUNTRIES_API_KEY;
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    process.env.REST_COUNTRIES_API_KEY = 'test-key';
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    (global as any).fetch = jest.fn();
  });

  afterEach(() => {
    consoleError.mockRestore();
    process.env.REST_COUNTRIES_API_KEY = originalKey;
  });

  it.each([
    ['missing', undefined],
    ['empty', ''],
    ['too long', 'IRL'],
    ['non-alphabetic', '1E'],
    ['a path traversal attempt', '../../etc/passwd'],
    ['a repeated param (array)', ['IE', 'FR']],
  ])('rejects %s code without calling upstream', async (_label, code) => {
    const res = await call({ code });

    expect(res.statusCode).toBe(400);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('accepts a valid alpha-2 code and sends the key as a bearer token', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: { objects: [{ codes: { alpha_2: 'IE' } }] } }),
    });

    const res = await call({ code: 'ie' });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/codes.alpha_2/IE'),
      { headers: { Authorization: 'Bearer test-key' } }
    );
    expect(res.statusCode).toBe(200);
    expect(res.headers['Cache-Control']).toContain('s-maxage=3600');
  });

  it('collapses an upstream 401 to 502 rather than advertising the key state', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 401, json: async () => ({}) });

    const res = await call({ code: 'IE' });

    expect(res.statusCode).toBe(502);
    expect(JSON.stringify(res.body)).not.toMatch(/401|unauthor/i);
  });

  it('passes an upstream 404 through as a 404', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 404, json: async () => ({}) });

    expect((await call({ code: 'XX' })).statusCode).toBe(404);
  });

  it('returns 500 when the API key is not configured', async () => {
    delete process.env.REST_COUNTRIES_API_KEY;

    const res = await call({ code: 'IE' });

    expect(res.statusCode).toBe(500);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('returns 500 when the upstream request throws', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('socket hang up'));

    const res = await call({ code: 'IE' });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Internal server error');
  });
});
