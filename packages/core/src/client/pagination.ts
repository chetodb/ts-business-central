import type { HttpClient } from '../http/http.client.js';
import type { BcDebugOptions, BcGetResponse, BcRequestOptions } from '../types/index.js';

/**
 * Follows `@odata.nextLink` to collect all pages of results
 * into a single array.
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
