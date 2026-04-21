import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BcFilter } from '../odata/filter-builder.js';
import { BusinessCentralClient } from './business-central.client.js';

describe('BusinessCentralClient', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  const config = {
    tenantId: 'tenant-123',
    environment: 'production',
    companyName: 'MyCompany',
    azureKeys: [
      {
        name: 'main',
        clientId: 'client-id',
        clientSecret: 'secret',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  it('should be instantiable with valid config', () => {
    const client = new BusinessCentralClient(config);
    expect(client).toBeDefined();
    // No longer testing properties that don't exist
  });

  it('should perform a simple GET', async () => {
    const mockData = { value: [{ id: 1, name: 'Test' }] };

    // Mock token request
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ access_token: 'fake-token', expires_in: 3600 }),
    });

    // Mock data request
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockData),
    });

    const client = new BusinessCentralClient(config);
    const result = await client.get('items');

    expect(result).toEqual(mockData.value);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should log duration when debug.duration is enabled', async () => {
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => undefined);
    const mockData = { value: [{ id: 1 }] };

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ access_token: 'fake-token', expires_in: 3600 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockData),
      });

    const client = new BusinessCentralClient(config);
    await client.get('items', undefined, undefined, { duration: true });

    expect(debugSpy).toHaveBeenCalledWith(
      expect.stringContaining('[BC CLIENT] GET items completed in'),
    );
    debugSpy.mockRestore();
  });

  it('should perform a POST request', async () => {
    const mockRecord = { name: 'New Item' };
    const mockResponse = { id: '123', ...mockRecord };

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ access_token: 'fake', expires_in: 3600 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockResponse),
      });

    const client = new BusinessCentralClient(config);
    const result = await client.post('items', mockRecord);

    expect(result).toEqual(mockResponse);
  });

  it('should perform a DELETE request with If-Match header', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ access_token: 'fake', expires_in: 3600 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

    const client = new BusinessCentralClient(config);
    await client.delete('items', { id: '123' });

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("items(id='123')"),
      expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({
          'If-Match': '*',
        }),
      }),
    );
  });

  it('should perform executeAction with unbound ODataV4 URL', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ access_token: 'fake', expires_in: 3600 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ ok: true }),
      });

    const client = new BusinessCentralClient(config);
    await client.executeAction('MyAction', { value: 1 });

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("/ODataV4/MyAction?Company='MyCompany'"),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('should perform PATCH and preserve custom If-Match header', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ access_token: 'fake', expires_in: 3600 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: '123', name: 'Updated' }),
      });

    const client = new BusinessCentralClient(config);
    await client.patch(
      'items',
      { id: '123' },
      { name: 'Updated' },
      { headers: { 'If-Match': 'W/"1"' } },
    );

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("items(id='123')"),
      expect.objectContaining({
        method: 'PATCH',
        headers: expect.objectContaining({ 'If-Match': 'W/"1"' }),
      }),
    );
  });

  it('should perform PUT with default If-Match header', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ access_token: 'fake', expires_in: 3600 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: '123', name: 'Replaced' }),
      });

    const client = new BusinessCentralClient(config);
    await client.put('items', { id: '123' }, { id: '123', name: 'Replaced' });

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("items(id='123')"),
      expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({ 'If-Match': '*' }),
      }),
    );
  });

  describe('get() auto-chunking for large in() filters', () => {
    // 80 values × ~110 URL-encoded chars each ≈ 8 800 chars → triggers threshold
    const longValues = Array.from({ length: 80 }, (_, i) => `${'X'.repeat(100)}${i}`);
    const mockToken = {
      ok: true,
      json: () => Promise.resolve({ access_token: 'tok', expires_in: 3600 }),
    };
    const makeDataResponse = (items: unknown[]) => ({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ value: items }),
    });

    it('fires a single request when in() filter URL stays under limit', async () => {
      fetchMock
        .mockResolvedValueOnce(mockToken)
        .mockResolvedValueOnce(makeDataResponse([{ No: 'A' }]));

      const client = new BusinessCentralClient(config);
      const result = await client.get('items', {
        filter: BcFilter.build().in('No', ['A', 'B', 'C']),
      });

      expect(result).toEqual([{ No: 'A' }]);
      // 1 token + 1 data fetch only
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('automatically chunks and merges when URL exceeds 7500 chars', async () => {
      const filter = BcFilter.build().in('No', longValues);

      fetchMock
        .mockResolvedValueOnce(mockToken)
        // Each chunk response — mockResolvedValue applies to all remaining calls
        .mockResolvedValue(makeDataResponse([{ No: 'result' }]));

      const client = new BusinessCentralClient(config);
      const result = await client.get('items', { filter });

      expect(result).not.toBeUndefined();
      // Token (1) + one request per chunk (80 values / 50 = 2 chunks)
      expect(fetchMock).toHaveBeenCalledTimes(3);
      expect(result).toHaveLength(2); // one result per chunk
    });

    it('returns undefined if any chunk fails', async () => {
      const filter = BcFilter.build().in('No', longValues);

      fetchMock
        .mockResolvedValueOnce(mockToken)
        .mockResolvedValueOnce(makeDataResponse([{ No: 'ok' }]))
        .mockResolvedValueOnce({ ok: false, status: 400, json: () => Promise.resolve({}) });

      const client = new BusinessCentralClient(config);
      const result = await client.get('items', { filter });

      expect(result).toBeUndefined();
    });
  });
});
