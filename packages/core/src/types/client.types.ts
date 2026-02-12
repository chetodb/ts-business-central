import type { AzureConfig } from './azure-config.types.js';
import type { AzureKey } from './azure-key.types.js';
import type { BcDebugOptions, BcRequestOptions, BcSchemaVersion } from './options.types.js';

export type BcEnvironment = 'Production' | 'Development' | 'Sandbox' | 'labsandbox' | (string & {});

/**
 * Configuration options for the BusinessCentral client.
 * This is the main entry point for configuring the SDK.
 */
export interface BcClientOptions {
  /**
   * Business Central environment name.
   * Common values: 'Production', 'Sandbox', 'Development'.
   * Any custom string is also accepted.
   * @default 'Production'
   */
  environment?: BcEnvironment;

  /**
   * Business Central API version (e.g., 'v2.0', 'beta').
   * @default 'v2.0'
   */
  apiVersion?: string;

  /** Azure AD Tenant ID for Business Central. */
  tenantId: string;

  /** Company name in Business Central. */
  companyName: string;

  /**
   * OData schema version, appended as $schemaversion query parameter.
   * @default undefined
   */
  schemaversion?: BcSchemaVersion;

  /**
   * Azure AD authentication configuration.
   * Override defaults for custom Azure setups.
   */
  azureConfig?: AzureConfig;

  /**
   * Azure AD application credentials for authentication.
   * Provide multiple keys to enable automatic key rotation on rate limiting (429) or auth failures.
   * At least one key is required.
   */
  azureKeys: AzureKey[];

  /**
   * Default HTTP request options applied to all requests.
   * Can be overridden per-request.
   */
  requestOptions?: BcRequestOptions;

  /**
   * Debug and logging options.
   */
  debugOptions?: BcDebugOptions;
}
