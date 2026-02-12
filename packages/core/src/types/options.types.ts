import type { BcFilter } from '../index.js';

export type BcSchemaVersion = '2.0' | '2.1' | (string & {});

/**
 * Debug options to control logging verbosity.
 */
export interface BcDebugOptions {
  /** Log the duration of each request. */
  duration?: boolean;
  /** Log pagination progress during automatic paging. */
  showPaginationProgress?: boolean;
}

/**
 * Options for individual HTTP requests, overriding global defaults.
 */
export interface BcRequestOptions {
  /** Maximum number of retry attempts. */
  maxRetries?: number;
  /** Base delay in milliseconds between retries (used with exponential backoff). */
  retryDelay?: number;
  /** Request timeout in milliseconds. */
  timeout?: number;
  /** Additional HTTP headers to include in the request. */
  headers?: Record<string, string>;
}

/**
 * OData query options for GET requests.
 */
export interface BcGetOptions {
  /** OData $filter expression. Can be a raw string or a BcFilter builder instance. */
  filter?: string | BcFilter;
  /** OData $select — array of field names to return. */
  select?: string[];
  /** OData $expand — array of navigation properties to expand. */
  expand?: string[];
  /** OData $top — maximum number of records to return per page. */
  top?: number;
  /** OData $skip — number of records to skip. */
  skip?: number;
  /** OData $orderby — sorting expression (e.g. 'Name asc'). */
  orderby?: string;
  /** OData $count — include total count in response. */
  count?: boolean;
  /** OData $schemaversion — schema version for the request. */
  schemaversion?: BcSchemaVersion;
}
