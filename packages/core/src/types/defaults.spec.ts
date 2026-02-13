import { describe, expect, it } from 'vitest';
import {
  AZURE_CONFIG_DEFAULTS,
  DEBUG_OPTIONS_DEFAULTS,
  REQUEST_OPTIONS_DEFAULTS,
  resolveClientOptions,
} from './defaults.js';

describe('defaults', () => {
  it('should expose expected static defaults', () => {
    expect(AZURE_CONFIG_DEFAULTS.tokenUrl).toBe('login.microsoftonline.com');
    expect(REQUEST_OPTIONS_DEFAULTS.maxRetries).toBe(3);
    expect(DEBUG_OPTIONS_DEFAULTS.duration).toBe(false);
  });

  it('should resolve missing values using defaults', () => {
    const resolved = resolveClientOptions({
      tenantId: 'tenant-123',
      companyName: 'MyCompany',
      azureKeys: [{ name: 'k1', clientId: 'cid', clientSecret: 'sec' }],
    });

    expect(resolved.environment).toBe('Production');
    expect(resolved.apiVersion).toBe('v2.0');
    expect(resolved.azureConfig.basicUrl).toBe(AZURE_CONFIG_DEFAULTS.basicUrl);
    expect(resolved.requestOptions.maxRetries).toBe(REQUEST_OPTIONS_DEFAULTS.maxRetries);
    expect(resolved.debugOptions.showPaginationProgress).toBe(false);
  });

  it('should merge custom partial options over defaults', () => {
    const resolved = resolveClientOptions({
      tenantId: 'tenant-123',
      companyName: 'MyCompany',
      azureKeys: [{ name: 'k1', clientId: 'cid', clientSecret: 'sec' }],
      azureConfig: { ...AZURE_CONFIG_DEFAULTS, tokenUrl: 'custom.login.local' },
      requestOptions: { timeout: 2500 },
      debugOptions: { duration: true },
    });

    expect(resolved.azureConfig.tokenUrl).toBe('custom.login.local');
    expect(resolved.azureConfig.basicUrl).toBe(AZURE_CONFIG_DEFAULTS.basicUrl);
    expect(resolved.requestOptions.timeout).toBe(2500);
    expect(resolved.requestOptions.maxRetries).toBe(REQUEST_OPTIONS_DEFAULTS.maxRetries);
    expect(resolved.debugOptions.duration).toBe(true);
  });
});
