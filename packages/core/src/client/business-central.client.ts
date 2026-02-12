import { OAuth2Provider } from '../auth/oauth2.provider.js';
import { HttpClient } from '../http/http.client.js';
import { UrlBuilder } from '../http/url-builder.js';
import type { BcClientOptions } from '../types/client.types.js';
import {
  type BcDebugOptions,
  type BcGetOptions,
  type BcRequestOptions,
  resolveClientOptions,
} from '../types/index.js';
import { mergeOptions, withIfMatchHeader } from '../utils/index.js';
import { paginationLoop } from './pagination.js';

/**
 * Main Business Central API client.
 *
 * Provides a clean interface for CRUD operations against
 * the Business Central OData API. Handles authentication,
 * automatic pagination, retry, and key rotation internally.
 *
 * @example
 * ```ts
 * const bc = new BusinessCentralClient({
 *   tenantId: 'your-tenant-id',
 *   companyName: 'CRONUS',
 *   azureKeys: [{ name: 'main', clientId: '...', clientSecret: '...' }],
 * });
 *
 * const items = await bc.get('items');
 * ```
 */
export class BusinessCentralClient {
  private readonly auth: OAuth2Provider;
  private readonly http: HttpClient;
  private readonly urls: UrlBuilder;
  private readonly resolvedOptions: Required<BcClientOptions>;

  constructor(options: BcClientOptions) {
    this.resolvedOptions = resolveClientOptions(options);

    this.auth = new OAuth2Provider(this.resolvedOptions);

    this.urls = new UrlBuilder({
      basicUrl: this.resolvedOptions.azureConfig.basicUrl,
      apiVersion: this.resolvedOptions.apiVersion,
      tenantId: this.resolvedOptions.tenantId,
      environment: this.resolvedOptions.environment,
      companyName: this.resolvedOptions.companyName,
      tokenUrl: this.resolvedOptions.azureConfig.tokenUrl,
    });

    this.http = new HttpClient(
      this.resolvedOptions.requestOptions as Required<BcRequestOptions>,
      (forceRefresh) => this.auth.getAuthHeader(forceRefresh),
      () => this.auth.rotateKey(),
    );
  }

  // ===========================================================================
  // GET — with automatic OData pagination
  // ===========================================================================

  /**
   * Retrieves records from a Business Central endpoint.
   *
   * Automatically follows `@odata.nextLink` for paginated results,
   * returning all records as a single flat array.
   *
   * @param endpoint - The entity set name (e.g. 'items', 'customers')
   * @param queryOptions - OData query parameters ($filter, $select, etc.)
   * @param requestOptions - Per-request retry/timeout overrides
   * @param debugOptions - Per-request debug/logging overrides
   * @returns Array of records, or `undefined` if the request failed
   */
  async get<T = unknown>(
    endpoint: string,
    queryOptions?: BcGetOptions,
    requestOptions?: BcRequestOptions,
    debugOptions?: BcDebugOptions,
  ): Promise<T[] | undefined> {
    const debug = mergeOptions(this.resolvedOptions.debugOptions, debugOptions);
    const startTime = performance.now();

    const url = this.urls.getUrl(endpoint, queryOptions);
    const result = await paginationLoop<T>(this.http, url, endpoint, debug, requestOptions);

    if (debug.duration) {
      console.debug(
        `[BC SDK] GET ${endpoint} completed in ${(performance.now() - startTime).toFixed(1)}ms`,
      );
    }

    return result;
  }

  // ===========================================================================
  // POST — create records and execute actions
  // ===========================================================================

  /**
   * Creates a new record on the specified endpoint.
   *
   * @param endpoint - The entity set name (e.g. 'items')
   * @param data - The record data to create
   * @param requestOptions - Per-request retry/timeout overrides
   * @returns The created record, or `undefined` on failure
   */
  async post<T = unknown, R = T>(
    endpoint: string,
    data: T,
    requestOptions?: BcRequestOptions,
  ): Promise<R | undefined> {
    const url = this.urls.postUrl(endpoint);
    return this.http.request<R>('POST', url, data, requestOptions);
  }

  /**
   * Executes an unbound OData action on Business Central.
   *
   * Uses a different URL pattern than regular CRUD operations
   * (ODataV4 route instead of the company-scoped entity route).
   *
   * @param endpoint - The action name
   * @param data - The action payload
   * @param requestOptions - Per-request retry/timeout overrides
   * @returns The action result, or `undefined` on failure
   */
  async executeAction<T = unknown, R = T>(
    endpoint: string,
    data: T,
    requestOptions?: BcRequestOptions,
  ): Promise<R | undefined> {
    const url = this.urls.executeActionUrl(endpoint);
    return this.http.request<R>('POST', url, data, requestOptions);
  }

  // ===========================================================================
  // PATCH — partial update
  // ===========================================================================

  /**
   * Partially updates an existing record.
   *
   * Automatically includes `If-Match: *` unless overridden via `requestOptions.headers`.
   *
   * @param endpoint - The entity set name
   * @param criteria - Record key(s) for OData key predicate (e.g. `{ No: 'ITEM-001' }`)
   * @param data - The fields to update
   * @param requestOptions - Per-request retry/timeout overrides
   * @returns The updated record, or `undefined` on failure
   */
  async patch<T = unknown, R = T>(
    endpoint: string,
    criteria: unknown,
    data: Partial<T>,
    requestOptions?: BcRequestOptions,
  ): Promise<R | undefined> {
    const options = withIfMatchHeader(requestOptions);
    const url = this.urls.patchUrl(endpoint, criteria);
    return this.http.request<R>('PATCH', url, data, options);
  }

  // ===========================================================================
  // PUT — full replacement
  // ===========================================================================

  /**
   * Fully replaces an existing record.
   *
   * Automatically includes `If-Match: *` unless overridden via `requestOptions.headers`.
   *
   * @param endpoint - The entity set name
   * @param criteria - Record key(s) for OData key predicate
   * @param data - The complete record data
   * @param requestOptions - Per-request retry/timeout overrides
   * @returns The replaced record, or `undefined` on failure
   */
  async put<T = unknown, R = T>(
    endpoint: string,
    criteria: unknown,
    data: T,
    requestOptions?: BcRequestOptions,
  ): Promise<R | undefined> {
    const options = withIfMatchHeader(requestOptions);
    const url = this.urls.putUrl(endpoint, criteria);
    return this.http.request<R>('PUT', url, data, options);
  }

  // ===========================================================================
  // DELETE
  // ===========================================================================

  /**
   * Deletes a record from the specified endpoint.
   *
   * Automatically includes `If-Match: *` unless overridden via `requestOptions.headers`.
   *
   * @param endpoint - The entity set name
   * @param criteria - Record key(s) for OData key predicate
   * @param requestOptions - Per-request retry/timeout overrides
   * @returns The response, or `undefined` on failure
   */
  async delete<R = unknown>(
    endpoint: string,
    criteria: unknown,
    requestOptions?: BcRequestOptions,
  ): Promise<R | undefined> {
    const options = withIfMatchHeader(requestOptions);
    const url = this.urls.deleteUrl(endpoint, criteria);
    return this.http.request<R>('DELETE', url, undefined, options);
  }

  // ===========================================================================
  // Internal helpers — Moved to client.helpers.ts
  // ===========================================================================
}
