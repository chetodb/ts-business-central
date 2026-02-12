import type { BcRequestOptions } from '../types/index.js';

/**
 * Ensures `If-Match: *` is set unless the caller provides a custom value.
 * Used for PATCH, PUT, and DELETE operations in Business Central.
 */
export function withIfMatchHeader(requestOptions?: BcRequestOptions): BcRequestOptions {
  const headers = requestOptions?.headers ?? {};
  const hasIfMatch = Object.keys(headers).some((key) => key.toLowerCase() === 'if-match');

  return {
    ...requestOptions,
    headers: {
      ...headers,
      ...(hasIfMatch ? {} : { 'If-Match': '*' }),
    },
  };
}
