import type { HttpClient } from '../http/http.client.js';
import type { BcDebugOptions, BcGetResponse, BcRequestOptions } from '../types/index.js';

/**
 * Follows `@odata.nextLink` to collect all pages of results
 * into a single array.
 *
 * @param http - The configured internal HTTP client.
 * @param firstUrl - The initial URL to start fetching from.
 * @param endpoint - The name of the endpoint (used for debug logging).
 * @param debugOptions - Debug configuration to track pagination progress.
 * @param requestOptions - Extra request-level options like timeout or custom headers.
 * @returns A promise resolving to the concatenated array of all records `T[]`, or undefined if a request fails.
 */
export async function paginationLoop<T>(
  http: HttpClient,
  firstUrl: string,
  endpoint: string,
  debugOptions: Required<BcDebugOptions>,
  requestOptions?: BcRequestOptions,
): Promise<T[] | undefined> {
  const allRecords: T[] = [];
  let pageCount = 1;
  let currentUrl: string | undefined = firstUrl;

  while (currentUrl) {
    const response: BcGetResponse<T> | undefined = await http.request<BcGetResponse<T>>(
      'GET',
      currentUrl,
      undefined,
      requestOptions,
    );

    if (!response) return undefined;

    allRecords.push(...response.value);

    if (debugOptions.showPaginationProgress) {
      console.debug(
        `[BC Pagination] ${endpoint} — page ${pageCount}: ${response.value.length} records (total: ${allRecords.length})`,
      );
    }

    currentUrl = response['@odata.nextLink'];
    pageCount++;
  }

  return allRecords;
}
