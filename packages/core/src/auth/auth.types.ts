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
  /** Returns a valid Bearer token, optionally forcing a refresh. */
  getToken(forceRefresh?: boolean): Promise<string | null>;

  /** Returns a full Authorization header value (e.g., 'Bearer xxx'), optionally forcing a refresh. */
  getAuthHeader(forceRefresh?: boolean): Promise<string | null>;

  /** Rotates to the next available Azure Key. */
  rotateKey(): void;

  /** Returns the currently active Azure Key. */
  getCurrentKey(): AzureKey;
}
