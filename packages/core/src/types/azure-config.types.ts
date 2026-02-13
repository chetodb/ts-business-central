/**
 * Azure AD / Entra ID configuration for OAuth2 authentication.
 * Default values are provided for standard Business Central API access.
 */
export interface AzureConfig {
  /** OAuth2 scope for the Business Central API. */
  scope: string;
  /** Base URL for the Business Central API. */
  basicUrl: string;
  /** Azure AD token endpoint hostname. */
  tokenUrl: string;
  /** OAuth2 grant type. */
  grantType: string;
}
