import { describe, expect, it } from 'vitest';
import { UrlBuilder } from './url-builder.js';

describe('UrlBuilder', () => {
  const config = {
    basicUrl: 'https://api.businesscentral.dynamics.com',
    apiVersion: 'v2.0',
    tenantId: 'tenant-123',
    environment: 'production',
    companyName: 'MyCompany',
    tokenUrl: 'login.microsoftonline.com',
  };

  const builder = new UrlBuilder(config);

  it('should build a correct token URL', () => {
    const url = builder.tokenUrl();
    expect(url).toBe('https://login.microsoftonline.com/tenant-123/oauth2/v2.0/token');
  });

  it('should build a base entity GET URL', () => {
    const url = builder.getUrl('customers');
    expect(url).toBe(
      "https://api.businesscentral.dynamics.com/v2.0/tenant-123/production/ODataV4/Company('MyCompany')/customers",
    );
  });

  it('should build a GET URL with query options', () => {
    const url = builder.getUrl('items', {
      top: 10,
      filter: "Name eq 'Test'",
    });
    // URLSearchParams encodes spaces as + and ' as %27
    expect(url).toContain('$top=10');
    expect(url).toContain('$filter=Name+eq+%27Test%27');
  });

  it('should build a PATCH URL with OData keys', () => {
    const url = builder.patchUrl('customers', { id: 'cust-1' });
    expect(url).toBe(
      "https://api.businesscentral.dynamics.com/v2.0/tenant-123/production/ODataV4/Company('MyCompany')/customers(id='cust-1')",
    );
  });

  it('should build a PUT URL with OData keys', () => {
    const url = builder.putUrl('customers', { id: 'cust-1' });
    expect(url).toBe(
      "https://api.businesscentral.dynamics.com/v2.0/tenant-123/production/ODataV4/Company('MyCompany')/customers(id='cust-1')",
    );
  });

  it('should build an execute action URL (unbound)', () => {
    const url = builder.executeActionUrl('MyAction');
    expect(url).toBe(
      "https://api.businesscentral.dynamics.com/v2.0/tenant-123/production/ODataV4/MyAction?Company='MyCompany'",
    );
  });
});
