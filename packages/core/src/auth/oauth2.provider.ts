import { UrlBuilder } from '../http/url-builder.js';
import type { AzureKey } from '../types/azure-key.types.js';
import type { BcClientOptions } from '../types/client.types.js';
import { dateAddSeconds, dateFormat, dateIsBefore } from '../utils/date.utils.js';
import type { AuthProvider, TokenInfo, TokenResponse } from './auth.types.js';

/**
 * OAuth2 Client Credentials authentication provider for Azure AD / Entra ID.
 *
 * Features:
 * - In-memory token cache with automatic refresh (5 min before expiry)
 * - Round-robin key rotation on rate limiting (429) or auth failures
 * - Retry with exponential backoff on token acquisition
 */
export class OAuth2Provider implements AuthProvider {
  private currentToken: TokenInfo | null = null;
  private currentKey: AzureKey;

  private readonly urlBuilder: UrlBuilder;
  private readonly scope: string;
  private readonly grantType: string;
  private readonly keys: AzureKey[];

  /**
   * Initializes the OAuth2 Provider with the SDK options.
   *
   * @param options - The fully resolved SDK configuration options.
   * @throws Error if `options.azureKeys` is empty or undefined.
   */
  constructor(private readonly options: Required<BcClientOptions>) {
    if (!options.azureKeys || options.azureKeys.length === 0) {
      throw new Error('[BC - Auth] No Azure Keys provided. At least one key is required.');
    }

    this.keys = options.azureKeys;
    this.currentKey = this.keys[0] as AzureKey;
    this.scope = options.azureConfig.scope;
    this.grantType = options.azureConfig.grantType;

    this.urlBuilder = new UrlBuilder({
      basicUrl: options.azureConfig.basicUrl,
      apiVersion: options.apiVersion,
      tenantId: options.tenantId,
      environment: options.environment,
      companyName: options.companyName,
      tokenUrl: options.azureConfig.tokenUrl,
    });

    console.debug(`[BC - Auth] Connecting to environment: ${options.environment}`);
  }

  /**
   * Returns a valid access token. Uses cached token if still valid,
   * otherwise requests a new one from Azure AD.
   *
   * @param forceRefresh - If true, bypasses the cache and forces a new token request.
   * @returns The raw access token string, or null if the request fails repeatedly.
   */
  async getToken(forceRefresh = false): Promise<string | null> {
    if (
      !forceRefresh &&
      this.currentToken?.token &&
      dateIsBefore(new Date(), this.currentToken.expiresAt)
    ) {
      return this.currentToken.token;
    }

    const maxRetries = 3;
    let currentRetry = 0;

    while (currentRetry < maxRetries) {
      try {
        const tokenUrl = this.urlBuilder.tokenUrl();

        const response = await fetch(tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${btoa(`${this.currentKey.clientId}:${this.currentKey.clientSecret}`)}`,
          },
          body: new URLSearchParams({
            grant_type: this.grantType,
            scope: this.scope,
          }).toString(),
          signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
          throw new Error(`Token request failed: ${response.status} ${response.statusText}`);
        }

        const data = (await response.json()) as TokenResponse;

        // Cache token, refreshing 5 minutes (300s) before actual expiry
        this.currentToken = {
          token: data.access_token,
          expiresAt: dateAddSeconds(new Date(), data.expires_in - 300),
          lastUpdate: new Date(),
        };

        console.debug(
          `[BC - Auth] New token acquired (Key: ${this.currentKey.name}). Expires: ${dateFormat(this.currentToken.expiresAt)}`,
        );

        return this.currentToken.token;
      } catch (error) {
        currentRetry++;
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`[BC - Auth] Token attempt ${currentRetry}/${maxRetries} failed: ${message}`);

        if (currentRetry < maxRetries) {
          // On rate limit or auth error, try the next key
          if (this.keys.length > 1) {
            this.rotateKey();
          }

          const delay = 2 ** currentRetry * 1000;
          console.debug(`[BC - Auth] Retrying token in ${delay / 1000}s...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    console.error(`[BC - Auth] Failed to acquire token after ${maxRetries} attempts.`);
    return null;
  }

  /**
   * Returns a full 'Bearer xxx' authorization header value.
   *
   * @param forceRefresh - If true, bypasses the cache and forces a new token request.
   * @returns The fully formatted Authorization header string, or null if token acquisition fails.
   */
  async getAuthHeader(forceRefresh = false): Promise<string | null> {
    const token = await this.getToken(forceRefresh);
    return token ? `Bearer ${token}` : null;
  }

  /** Rotates to the next Azure Key in round-robin fashion. */
  rotateKey(): void {
    if (this.keys.length <= 1) return;

    const currentIndex = this.keys.findIndex((k) => k.name === this.currentKey.name);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % this.keys.length;

    const previousName = this.currentKey.name;
    this.currentKey = this.keys[nextIndex] as AzureKey;
    this.currentToken = null;

    console.debug(`[BC - Auth] Rotating key: [${previousName}] → [${this.currentKey.name}]`);
  }

  /** Returns the currently active Azure Key. */
  getCurrentKey(): AzureKey {
    return this.currentKey;
  }
}
