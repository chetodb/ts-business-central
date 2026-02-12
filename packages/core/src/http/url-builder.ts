import type { BcGetOptions } from '../types/options.types.js';
import { formatODataKeys, formatODataQueryOptions } from '../utils/odata-query.utils.js';

interface UrlBuilderConfig {
  basicUrl: string;
  apiVersion: string;
  tenantId: string;
  environment: string;
  companyName: string;
  tokenUrl: string;
}

/**
 * Builds Business Central OData URLs from configuration and endpoint details.
 * Pure utility — no side effects, no state beyond config.
 */
export class UrlBuilder {
  constructor(private readonly config: UrlBuilderConfig) {}

  /** Azure AD token endpoint URL. */
  tokenUrl(): string {
    return `https://${this.config.tokenUrl}/${this.config.tenantId}/oauth2/${this.config.apiVersion}/token`;
  }

  /** GET URL with OData query options. */
  getUrl(endpoint: string, queryOptions?: BcGetOptions): string {
    return `${this.baseEntityUrl(endpoint)}${formatODataQueryOptions(queryOptions)}`;
  }

  /** POST URL for creating records. */
  postUrl(endpoint: string): string {
    return this.baseEntityUrl(endpoint);
  }

  /** URL for executing unbound actions. */
  executeActionUrl(endpoint: string): string {
    const { basicUrl, apiVersion, tenantId, environment, companyName } = this.config;
    return `${basicUrl}/${apiVersion}/${tenantId}/${environment}/ODataV4/${endpoint}?Company='${companyName}'`;
  }

  /** PATCH URL for partial updates (with OData key criteria). */
  patchUrl(endpoint: string, criteria: unknown): string {
    return `${this.baseEntityUrl(endpoint)}(${formatODataKeys(criteria)})`;
  }

  /** PUT URL for full replacements (with OData key criteria). */
  putUrl(endpoint: string, criteria: unknown): string {
    return `${this.baseEntityUrl(endpoint)}(${formatODataKeys(criteria)})`;
  }

  /** DELETE URL (with OData key criteria). */
  deleteUrl(endpoint: string, criteria: unknown): string {
    return `${this.baseEntityUrl(endpoint)}(${formatODataKeys(criteria)})`;
  }

  /** Builds the base entity URL with company. */
  private baseEntityUrl(endpoint: string): string {
    const { basicUrl, apiVersion, tenantId, environment, companyName } = this.config;
    return `${basicUrl}/${apiVersion}/${tenantId}/${environment}/ODataV4/Company('${companyName}')/${endpoint}`;
  }
}
