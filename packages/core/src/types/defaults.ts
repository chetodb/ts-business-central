import type { AzureConfig } from './azure-config.types.js';
import type { BcClientOptions } from './client.types.js';
import type { BcDebugOptions, BcRequestOptions } from './options.types.js';

/**
 * Default Azure AD configuration for Business Central API access.
 */
export const AZURE_CONFIG_DEFAULTS: AzureConfig = {
  scope: 'https://api.businesscentral.dynamics.com/.default',
  basicUrl: 'https://api.businesscentral.dynamics.com',
  tokenUrl: 'login.microsoftonline.com',
  grantType: 'client_credentials',
};

/**
 * Default HTTP request options.
 */
export const REQUEST_OPTIONS_DEFAULTS: Required<BcRequestOptions> = {
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 10000,
  headers: {},
};

/**
 * Default debug options (all disabled).
 */
export const DEBUG_OPTIONS_DEFAULTS: Required<BcDebugOptions> = {
  duration: false,
  showPaginationProgress: false,
};

/**
 * Resolves partial client options into a fully populated configuration
 * by merging with default values.
 */
export function resolveClientOptions(options: BcClientOptions): Required<BcClientOptions> {
  return {
    environment: options.environment ?? 'Production',
    apiVersion: options.apiVersion ?? 'v2.0',
    tenantId: options.tenantId,
    companyName: options.companyName,
    schemaversion: options.schemaversion ?? '',
    azureConfig: { ...AZURE_CONFIG_DEFAULTS, ...options.azureConfig },
    azureKeys: options.azureKeys,
    requestOptions: { ...REQUEST_OPTIONS_DEFAULTS, ...options.requestOptions },
    debugOptions: { ...DEBUG_OPTIONS_DEFAULTS, ...options.debugOptions },
  };
}
