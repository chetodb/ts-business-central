import type { BcRequestOptions } from '../types/options.types.js';
import type { HttpMethod } from './http.types.js';

/** Callback to obtain a valid Authorization header (e.g. 'Bearer xxx'). */
export type AuthHeaderProvider = (forceRefresh: boolean) => Promise<string | null>;

/** Callback to rotate to the next Azure Key on rate limiting. */
export type KeyRotator = () => void;

interface ResolvedRequestOptions extends Required<BcRequestOptions> {}

/**
 * Framework-agnostic HTTP client using native `fetch`.
 * Handles retry with exponential backoff, token refresh, and key rotation.
 */
export class HttpClient {
  constructor(
    private readonly defaults: ResolvedRequestOptions,
    private readonly getAuthHeader: AuthHeaderProvider,
    private readonly rotateKey: KeyRotator,
  ) {}

  /**
   * Executes an HTTP request with retry logic, automatic token refresh,
   * and key rotation on rate limiting.
   *
   * @param method - The HTTP method to use (e.g., 'GET', 'POST').
   * @param url - The fully qualified URL for the request.
   * @param data - Optional request body payload (will be JSON stringified).
   * @param options - Optional request-specific options overriding defaults (e.g. maxRetries, timeout).
   * @returns The parsed JSON response of type `T`, or `undefined` if the response is 204 No Content or cannot be fulfilled.
   */
  async request<T>(
    method: HttpMethod,
    url: string,
    data?: unknown,
    options?: BcRequestOptions,
  ): Promise<T | undefined> {
    const {
      maxRetries,
      retryDelay,
      timeout,
      headers: extraHeaders,
    } = {
      ...this.defaults,
      ...options,
    };

    let currentRetry = 0;

    while (currentRetry < maxRetries) {
      try {
        const authHeader = await this.getAuthHeader(false);
        if (!authHeader) {
          return undefined; // If no token is acquired after key rotation, abort the request.
        }

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          Authorization: authHeader,
          ...extraHeaders,
          ...options?.headers,
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
          const response = await fetch(url, {
            method,
            headers,
            body: data !== undefined ? JSON.stringify(data) : undefined,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            if (response.status === 204) return undefined;
            return (await response.json()) as T;
          }

          // Non-ok response — let error handler decide retry
          const shouldRetry = await this.handleErrorResponse(
            response,
            currentRetry + 1,
            maxRetries,
            retryDelay,
          );

          if (!shouldRetry) {
            return undefined;
          }
        } finally {
          clearTimeout(timeoutId);
        }
      } catch (err: unknown) {
        const shouldRetry = this.handleNetworkError(err, currentRetry + 1, maxRetries, retryDelay);

        if (!shouldRetry) return undefined;

        const delay = 2 ** (currentRetry + 1) * retryDelay;
        await this.sleep(delay);
      }

      currentRetry++;
    }

    return undefined;
  }

  /**
   * Handles non-OK HTTP responses.
   * Returns true if the request should be retried.
   */
  private async handleErrorResponse(
    response: Response,
    currentRetry: number,
    maxRetries: number,
    retryDelay: number,
  ): Promise<boolean> {
    const { status, statusText } = response;

    // 429 Too Many Requests → rotate key and retry
    if (status === 429) {
      console.warn(
        `[BC HTTPS] 429 Too Many Requests (attempt ${currentRetry}/${maxRetries}). Rotating key...`,
      );
      this.rotateKey();
      await this.sleep(2000);
      return true;
    }

    // 401 Unauthorized → rotate key, force token refresh and retry
    if (status === 401) {
      console.warn(
        `[BC HTTPS] 401 Unauthorized (attempt ${currentRetry}/${maxRetries}). Rotating key and refreshing token...`,
      );
      this.rotateKey();
      await this.getAuthHeader(true);
      return true;
    }

    // 400 Bad Request → client error, no retry
    if (status === 400) {
      const body = await this.safeReadJson(response);
      const detail = (body as Record<string, Record<string, string>>)?.error?.message || statusText;
      console.error(`[BC HTTPS] 400 Bad Request: ${detail}`);
      return false;
    }

    // 501 Not Implemented → endpoint doesn't support this operation
    if (status === 501) {
      console.error(`[BC HTTPS] 501 Not Implemented: ${response.url}`);
      return false;
    }

    // 5xx Server errors → retry with backoff
    if (status >= 500) {
      const delay = 2 ** currentRetry * retryDelay;
      console.warn(
        `[BC HTTPS] Server error ${status} (attempt ${currentRetry}/${maxRetries}). Retrying in ${delay / 1000}s...`,
      );
      await this.sleep(delay);
      return true;
    }

    // 408 Request Timeout → retry with backoff
    if (status === 408) {
      const delay = 2 ** currentRetry * retryDelay;
      console.warn(
        `[BC HTTPS] Request timeout (attempt ${currentRetry}/${maxRetries}). Retrying in ${delay / 1000}s...`,
      );
      await this.sleep(delay);
      return true;
    }

    // Other errors → log and stop
    console.error(`[BC HTTPS] HTTP ${status} ${statusText}`);
    return false;
  }

  /**
   * Handles network-level errors (connection refused, DNS failure, abort/timeout).
   * Returns true if the request should be retried.
   */
  private handleNetworkError(
    err: unknown,
    currentRetry: number,
    maxRetries: number,
    _retryDelay: number,
  ): boolean {
    const isAbort = err instanceof DOMException && err.name === 'AbortError';
    const message = err instanceof Error ? err.message : String(err);

    if (isAbort) {
      console.warn(
        `[BC HTTPS] Request timeout (attempt ${currentRetry}/${maxRetries}): ${message}`,
      );
      return currentRetry < maxRetries;
    }

    console.error(`[BC HTTPS] Network error (attempt ${currentRetry}/${maxRetries}): ${message}`);
    return currentRetry < maxRetries;
  }

  /** Safely reads JSON from a response, returning undefined on failure. */
  private async safeReadJson(response: Response): Promise<unknown> {
    try {
      return await response.json();
    } catch (err) {
      console.debug(
        `[BC HTTPS] Failed to parse response body: ${err instanceof Error ? err.message : String(err)}`,
      );
      return undefined;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
