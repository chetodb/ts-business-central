import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { BcClientOptions } from '../types/client.types.js';
import { resolveClientOptions } from '../types/defaults.js';
import { OAuth2Provider } from './oauth2.provider.js';

describe('OAuth2Provider', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  const baseOptions: BcClientOptions = {
    tenantId: 'tenant-123',
    environment: 'production',
    companyName: 'MyCompany',
    azureKeys: [
      {
        name: 'key-a',
        clientId: 'client-a',
        clientSecret: 'secret-a',
      },
      {
        name: 'key-b',
        clientId: 'client-b',
        clientSecret: 'secret-b',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    vi.useRealTimers();
  });

  it('should throw if no Azure keys are provided', () => {
    const options = resolveClientOptions({
      ...baseOptions,
      azureKeys: [],
    });

    expect(() => new OAuth2Provider(options)).toThrow(
      '[BC - Auth] No Azure Keys provided. At least one key is required.',
    );
  });

  it('should initialize with the first key', () => {
    const provider = new OAuth2Provider(resolveClientOptions(baseOptions));

    expect(provider.getCurrentKey().name).toBe('key-a');
  });

  it('should rotate keys in round-robin order', () => {
    const provider = new OAuth2Provider(resolveClientOptions(baseOptions));

    provider.rotateKey();
    expect(provider.getCurrentKey().name).toBe('key-b');

    provider.rotateKey();
    expect(provider.getCurrentKey().name).toBe('key-a');
  });

  it('should fetch and return a token', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () =>
        Promise.resolve({ access_token: 'token-1', expires_in: 3600, token_type: 'Bearer' }),
    });

    const provider = new OAuth2Provider(resolveClientOptions(baseOptions));
    const token = await provider.getToken();

    expect(token).toBe('token-1');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://login.microsoftonline.com/tenant-123/oauth2/v2.0/token',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: `Basic ${btoa('client-a:secret-a')}`,
        }),
      }),
    );
  });

  it('should reuse cached token when not expired', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () =>
        Promise.resolve({ access_token: 'cached-token', expires_in: 3600, token_type: 'Bearer' }),
    });

    const provider = new OAuth2Provider(resolveClientOptions(baseOptions));

    const first = await provider.getToken();
    const second = await provider.getToken();

    expect(first).toBe('cached-token');
    expect(second).toBe('cached-token');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should refresh token when forceRefresh is true', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () =>
          Promise.resolve({ access_token: 'token-1', expires_in: 3600, token_type: 'Bearer' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () =>
          Promise.resolve({ access_token: 'token-2', expires_in: 3600, token_type: 'Bearer' }),
      });

    const provider = new OAuth2Provider(resolveClientOptions(baseOptions));

    const first = await provider.getToken();
    const second = await provider.getToken(true);

    expect(first).toBe('token-1');
    expect(second).toBe('token-2');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should return Bearer auth header', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () =>
        Promise.resolve({ access_token: 'header-token', expires_in: 3600, token_type: 'Bearer' }),
    });

    const provider = new OAuth2Provider(resolveClientOptions(baseOptions));
    const authHeader = await provider.getAuthHeader();

    expect(authHeader).toBe('Bearer header-token');
  });

  it('should return null auth header when token acquisition fails', async () => {
    vi.useFakeTimers();
    fetchMock.mockRejectedValue(new Error('network down'));

    const provider = new OAuth2Provider(resolveClientOptions(baseOptions));
    const headerPromise = provider.getAuthHeader();

    await vi.advanceTimersByTimeAsync(10_000);
    const authHeader = await headerPromise;

    expect(authHeader).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('should return null after max retries when token endpoint keeps failing', async () => {
    vi.useFakeTimers();
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Server Error',
    });

    const provider = new OAuth2Provider(resolveClientOptions(baseOptions));
    const tokenPromise = provider.getToken();

    await vi.advanceTimersByTimeAsync(10_000);
    const token = await tokenPromise;

    expect(token).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('should keep same key when rotateKey is called with a single key', () => {
    const singleKeyProvider = new OAuth2Provider(
      resolveClientOptions({
        ...baseOptions,
        azureKeys: [
          {
            name: 'key-a',
            clientId: 'client-a',
            clientSecret: 'secret-a',
          },
        ],
      }),
    );

    singleKeyProvider.rotateKey();
    expect(singleKeyProvider.getCurrentKey().name).toBe('key-a');
  });
});
