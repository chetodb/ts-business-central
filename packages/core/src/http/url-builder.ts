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

  /** Constructs the Azure AD token endpoint URL based on tenant and API version. */
  tokenUrl(): string {
    return `https://${this.config.tokenUrl}/${this.config.tenantId}/oauth2/${this.config.apiVersion}/token`;
  }

  /** Constructs the GET URL with OData query options appended. */
  getUrl(endpoint: string, queryOptions?: BcGetOptions): string {
    return `${this.baseEntityUrl(endpoint)}${formatODataQueryOptions(queryOptions)}`;
  }

  /** Constructs the POST URL for creating records. */
  postUrl(endpoint: string): string {
    return this.baseEntityUrl(endpoint);
  }

  /** Constructs the URL for executing unbound actions. */
  executeActionUrl(endpoint: string): string {
    const { basicUrl, apiVersion, tenantId, environment, companyName } = this.config;
    return `${basicUrl}/${apiVersion}/${tenantId}/${environment}/ODataV4/${endpoint}?Company='${companyName}'`;
  }

  /**
   * Constructs the PATCH URL for partial updates.
   *
   * @param primaryKeys - An object representing the OData primary keys of the entity.
   */
  patchUrl(endpoint: string, primaryKeys: unknown): string {
    return `${this.baseEntityUrl(endpoint)}(${formatODataKeys(primaryKeys)})`;
  }

  /**
   * Constructs the PUT URL for full record replacements.
   *
   * @param primaryKeys - An object representing the OData primary keys of the entity.
   */
  putUrl(endpoint: string, primaryKeys: unknown): string {
    return `${this.baseEntityUrl(endpoint)}(${formatODataKeys(primaryKeys)})`;
  }

  /**
   * Constructs the DELETE URL.
   *
   * @param primaryKeys - An object representing the OData primary keys of the entity.
   */
  deleteUrl(endpoint: string, primaryKeys: unknown): string {
    return `${this.baseEntityUrl(endpoint)}(${formatODataKeys(primaryKeys)})`;
  }

  /** Builds the base entity URL with company. */
  private baseEntityUrl(endpoint: string): string {
    const { basicUrl, apiVersion, tenantId, environment, companyName } = this.config;
    return `${basicUrl}/${apiVersion}/${tenantId}/${environment}/ODataV4/Company('${companyName}')/${endpoint}`;
  }
}
