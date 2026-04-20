import { BcFilter, BusinessCentralClient, OAuth2Provider } from '@chetodb/business-central';
import { describe, expect, it } from 'vitest';
import * as publicApi from './index.js';

describe('public API', () => {
  it('re-exports the curated core SDK surface from the NestJS package entrypoint', () => {
    expect(publicApi.BusinessCentralClient).toBe(BusinessCentralClient);
    expect(publicApi.BcFilter).toBe(BcFilter);
    expect(publicApi.OAuth2Provider).toBe(OAuth2Provider);
    // Internal implementation details must not leak into the public API
    expect('resolveClientOptions' in publicApi).toBe(false);
    expect('AZURE_CONFIG_DEFAULTS' in publicApi).toBe(false);
  });
});
