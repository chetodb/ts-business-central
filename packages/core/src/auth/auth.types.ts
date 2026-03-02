import type { AzureKey } from '../types/azure-key.types.js';

/**
 * Represents a cached OAuth2 token with expiration tracking.
 */
export interface TokenInfo {
  token: string;
  expiresAt: Date;
  lastUpdate: Date;
}

/**
 * Raw token response from Azure AD / Entra ID.
 */
export interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

/**
 * Contract for authentication providers.
 * Implement this interface to provide custom authentication strategies.
 */
export interface AuthProvider {
  /**
   * Retrieves a valid Bearer token.
   *
   * @param forceRefresh - If true, ignores any cached token and requests a new one.
   * @returns A promise that resolves to the token string, or null if creation fails.
   */
  getToken(forceRefresh?: boolean): Promise<string | null>;

  /**
   * Retrieves a full Authorization header value (e.g., 'Bearer xxx').
   *
   * @param forceRefresh - If true, ignores any cached token and requests a new one.
   * @returns A promise that resolves to the complete header string, or null if creation fails.
   */
  getAuthHeader(forceRefresh?: boolean): Promise<string | null>;

  /**
   * Rotates to the next available Azure Key in the configuration.
   * Used automatically by the client when it encounters rate limits (429) or token errors.
   */
  rotateKey(): void;

  /**
   * Returns the Azure Key currently being used by the provider.
   *
   * @returns The active ActiveKey object containing clientId and name.
   */
  getCurrentKey(): AzureKey;
}
