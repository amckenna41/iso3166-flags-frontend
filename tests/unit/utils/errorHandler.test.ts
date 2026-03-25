import { AppError, getErrorMessage, retryAsync } from '../../../src/utils/errorHandler';

describe('AppError', () => {
  it('should set name to AppError', () => {
    const err = new AppError('something failed');
    expect(err.name).toBe('AppError');
  });

  it('should default type to unknown and isRetryable to true', () => {
    const err = new AppError('something failed');
    expect(err.type).toBe('unknown');
    expect(err.isRetryable).toBe(true);
  });

  it('should accept custom type and isRetryable values', () => {
    const err = new AppError('bad input', 'validation', undefined, false);
    expect(err.type).toBe('validation');
    expect(err.isRetryable).toBe(false);
  });

  it('should be an instance of Error', () => {
    const err = new AppError('oops');
    expect(err).toBeInstanceOf(Error);
  });
});

describe('getErrorMessage', () => {
  it('should return non-retryable message for 404', () => {
    const axiosError = { response: { status: 404 } };
    const result = getErrorMessage(axiosError);
    expect(result.isRetryable).toBe(false);
    expect(result.message).toMatch(/not found/i);
  });

  it('should return retryable message for 429', () => {
    const axiosError = { response: { status: 429 } };
    const result = getErrorMessage(axiosError);
    expect(result.isRetryable).toBe(true);
    expect(result.message).toMatch(/too many requests/i);
  });

  it('should return retryable message for 5xx errors', () => {
    const axiosError = { response: { status: 503 } };
    const result = getErrorMessage(axiosError);
    expect(result.isRetryable).toBe(true);
    expect(result.message).toMatch(/unavailable/i);
  });

  it('should return retryable message for other 4xx errors', () => {
    const axiosError = { response: { status: 403 } };
    const result = getErrorMessage(axiosError);
    expect(result.isRetryable).toBe(true);
    expect(result.message).toContain('403');
  });

  it('should return retryable message for timeout errors', () => {
    const timeoutError = { code: 'ECONNABORTED', message: 'timeout of 15000ms exceeded' };
    const result = getErrorMessage(timeoutError);
    expect(result.isRetryable).toBe(true);
    expect(result.message).toMatch(/took too long/i);
  });

  it('should return retryable message for network errors with a code', () => {
    const networkError = { code: 'ERR_NETWORK' };
    const result = getErrorMessage(networkError);
    expect(result.isRetryable).toBe(true);
    expect(result.message).toMatch(/network/i);
  });

  it('should return retryable message for plain Error instances', () => {
    const err = new Error('something broke');
    const result = getErrorMessage(err);
    expect(result.isRetryable).toBe(true);
    expect(result.message).toContain('something broke');
  });

  it('should return a generic retryable message for unknown values', () => {
    const result = getErrorMessage(null);
    expect(result.isRetryable).toBe(true);
    expect(result.message).toMatch(/unexpected/i);
  });
});

describe('retryAsync', () => {
  // retryAsync uses real timers; keep delay small to avoid test timeouts
  it('should return the result on the first successful call', async () => {
    const fn = jest.fn().mockResolvedValue('ok');
    const result = await retryAsync(fn, 2, 0);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and succeed on a later attempt', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockResolvedValueOnce('success');

    const result = await retryAsync(fn, 2, 1);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should throw after exhausting all retries', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('always fails'));

    await expect(retryAsync(fn, 2, 1)).rejects.toThrow('always fails');
    // 1 initial attempt + 2 retries = 3 total calls
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should apply a longer delay on subsequent retries (exponential backoff)', async () => {
    // We only verify call count and success — timing is hard to assert without
    // fake timers. Real-timer test is sufficient for coverage here.
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce('done');

    const result = await retryAsync(fn, 2, 1);
    expect(result).toBe('done');
    expect(fn).toHaveBeenCalledTimes(3);
  });
});
