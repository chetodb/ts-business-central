/**
 * Represents an Azure AD application credential used for authentication.
 * Multiple keys can be provided to enable automatic key rotation.
 */
export interface AzureKey {
  /** A friendly name to identify this key (used in log messages). */
  name: string;
  /** The Application (client) ID from Azure AD app registration. */
  clientId: string;
  /** The client secret value from Azure AD app registration. */
  clientSecret: string;
}
