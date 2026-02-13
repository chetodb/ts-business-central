import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpClient } from './http.client.js';

describe('HttpClient', () => {
  const mockAuthHeaderProvider = vi.fn().mockResolvedValue('Bearer mock-token');
  const mockKeyRotator = vi.fn();
  let fetchMock: ReturnType<typeof vi.fn>;
  const defaults = {
    maxRetries: 3,
    retryDelay: 10,
    timeout: 1000,
    headers: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock global fetch
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    vi.useRealTimers();
  });

  it('should make a successful GET request', async () => {
    const mockResponse = { value: 'test' };
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockResponse),
    });

    const client = new HttpClient(defaults, mockAuthHeaderProvider, mockKeyRotator);
    const result = await client.request('GET', 'https://api.test.com');

    expect(result).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.test.com',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-token',
        }),
      }),
    );
  });

  it('should handle 204 No Content', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 204,
    });

    const client = new HttpClient(defaults, mockAuthHeaderProvider, mockKeyRotator);
    const result = await client.request('DELETE', 'https://api.test.com');

    expect(result).toBeUndefined();
  });

  it('should retry on network error and eventually succeed', async () => {
    const mockResponse = { success: true };
    fetchMock.mockRejectedValueOnce(new Error('Network error')).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockResponse),
    });

    const client = new HttpClient(defaults, mockAuthHeaderProvider, mockKeyRotator);
    const result = await client.request('GET', 'https://api.test.com');

    expect(result).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should retry on AbortError and eventually succeed', async () => {
    vi.useFakeTimers();
    const mockResponse = { success: true };
    fetchMock
      .mockRejectedValueOnce(new DOMException('Aborted', 'AbortError'))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

    const client = new HttpClient(defaults, mockAuthHeaderProvider, mockKeyRotator);
    const resultPromise = client.request('GET', 'https://api.test.com');

    await vi.advanceTimersByTimeAsync(20);
    const result = await resultPromise;

    expect(result).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should retry on 429 and rotate key', async () => {
    vi.useFakeTimers();
    const mockResponse = { success: true };
    fetchMock
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

    const client = new HttpClient(defaults, mockAuthHeaderProvider, mockKeyRotator);
    const resultPromise = client.request('GET', 'https://api.test.com');
    await vi.advanceTimersByTimeAsync(2000);
    const result = await resultPromise;

    expect(result).toEqual(mockResponse);
    expect(mockKeyRotator).toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should retry on 500 server error', async () => {
    vi.useFakeTimers();
    const mockResponse = { success: true };
    fetchMock
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

    const client = new HttpClient(defaults, mockAuthHeaderProvider, mockKeyRotator);
    const resultPromise = client.request('GET', 'https://api.test.com');
    await vi.advanceTimersByTimeAsync(20);
    const result = await resultPromise;

    expect(result).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should return undefined when auth header cannot be obtained', async () => {
    const authProvider = vi.fn().mockResolvedValue(null);
    const client = new HttpClient(defaults, authProvider, mockKeyRotator);

    const result = await client.request('GET', 'https://api.test.com');

    expect(result).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('should handle 401 by rotating key, forcing refresh, and retrying', async () => {
    const mockResponse = { success: true };
    fetchMock
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

    const authProvider = vi.fn().mockResolvedValue('Bearer mock-token');
    const client = new HttpClient(defaults, authProvider, mockKeyRotator);
    const result = await client.request('GET', 'https://api.test.com');

    expect(result).toEqual(mockResponse);
    expect(mockKeyRotator).toHaveBeenCalledTimes(1);
    expect(authProvider).toHaveBeenCalledWith(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should stop on 400 bad request without retry', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: () => Promise.resolve({ error: { message: 'Invalid filter' } }),
    });

    const client = new HttpClient(defaults, mockAuthHeaderProvider, mockKeyRotator);
    const result = await client.request('GET', 'https://api.test.com');

    expect(result).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should stop on 501 not implemented without retry', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 501,
      statusText: 'Not Implemented',
      url: 'https://api.test.com',
    });

    const client = new HttpClient(defaults, mockAuthHeaderProvider, mockKeyRotator);
    const result = await client.request('POST', 'https://api.test.com', { demo: true });

    expect(result).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should retry on 408 request timeout and succeed', async () => {
    vi.useFakeTimers();
    const mockResponse = { success: true };
    fetchMock
      .mockResolvedValueOnce({
        ok: false,
        status: 408,
        statusText: 'Request Timeout',
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

    const client = new HttpClient(defaults, mockAuthHeaderProvider, mockKeyRotator);
    const resultPromise = client.request('GET', 'https://api.test.com');
    await vi.advanceTimersByTimeAsync(20);
    const result = await resultPromise;

    expect(result).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should stop after max retries on repeated network errors', async () => {
    vi.useFakeTimers();
    fetchMock.mockRejectedValue(new Error('still down'));

    const client = new HttpClient(defaults, mockAuthHeaderProvider, mockKeyRotator);
    const resultPromise = client.request('GET', 'https://api.test.com');

    await vi.advanceTimersByTimeAsync(2000);
    const result = await resultPromise;

    expect(result).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('should stop on unknown HTTP status without retry', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 418,
      statusText: "I'm a teapot",
    });

    const client = new HttpClient(defaults, mockAuthHeaderProvider, mockKeyRotator);
    const result = await client.request('GET', 'https://api.test.com');

    expect(result).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should use statusText fallback when 400 response body has no error.message', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: () => Promise.reject(new Error('invalid json')),
    });

    const client = new HttpClient(defaults, mockAuthHeaderProvider, mockKeyRotator);
    const result = await client.request('GET', 'https://api.test.com');

    expect(result).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should handle non-Error thrown values in network errors', async () => {
    vi.useFakeTimers();
    fetchMock.mockRejectedValue('network-string-error');

    const client = new HttpClient(defaults, mockAuthHeaderProvider, mockKeyRotator);
    const resultPromise = client.request('GET', 'https://api.test.com');

    await vi.advanceTimersByTimeAsync(2000);
    const result = await resultPromise;

    expect(result).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
