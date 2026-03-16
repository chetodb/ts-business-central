import { BcFilter, BusinessCentralClient } from '@chetodb/business-central';
import * as publicApi from './index.js';
import { describe, expect, it } from 'vitest';

describe('public API', () => {
  it('re-exports the curated core SDK surface from the NestJS package entrypoint', () => {
    expect(publicApi.BusinessCentralClient).toBe(BusinessCentralClient);
    expect(publicApi.BcFilter).toBe(BcFilter);
    expect('resolveClientOptions' in publicApi).toBe(false);
    expect('AZURE_CONFIG_DEFAULTS' in publicApi).toBe(false);
  });
});
