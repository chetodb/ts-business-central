import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { HttpClient } from '../http/http.client.js';
import { paginationLoop } from './pagination.js';

describe('paginationLoop', () => {
  const requestMock = vi.fn();
  const mockHttp = {
    request: requestMock,
  } as unknown as HttpClient;

  const debugOptions = {
    duration: false,
    showPaginationProgress: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return all records from a single page', async () => {
    const mockData = { value: [{ id: 1 }, { id: 2 }] };
    requestMock.mockResolvedValue(mockData);

    const result = await paginationLoop(mockHttp, 'url1', 'test', debugOptions);

    expect(result).toEqual(mockData.value);
    expect(mockHttp.request).toHaveBeenCalledTimes(1);
  });

  it('should follow @odata.nextLink to collect all pages', async () => {
    const page1 = {
      value: [{ id: 1 }],
      '@odata.nextLink': 'url2',
    };
    const page2 = {
      value: [{ id: 2 }],
    };

    requestMock.mockResolvedValueOnce(page1).mockResolvedValueOnce(page2);

    const result = await paginationLoop(mockHttp, 'url1', 'test', debugOptions);

    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    expect(mockHttp.request).toHaveBeenCalledTimes(2);
    expect(mockHttp.request).toHaveBeenNthCalledWith(2, 'GET', 'url2', undefined, undefined);
  });

  it('should return undefined if any page request fails', async () => {
    requestMock.mockResolvedValue(undefined);

    const result = await paginationLoop(mockHttp, 'url1', 'test', debugOptions);

    expect(result).toBeUndefined();
  });
});
