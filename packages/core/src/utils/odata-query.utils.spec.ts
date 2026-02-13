import { describe, expect, it } from 'vitest';
import { BcFilter } from '../odata/filter-builder.js';
import { formatODataKeys, formatODataQueryOptions } from './odata-query.utils.js';

describe('formatODataKeys', () => {
  it('should format string and number values', () => {
    const result = formatODataKeys({ Item_No: 'ABC', Line_No: 10 });

    expect(result).toBe("Item_No='ABC',Line_No=10");
  });

  it('should return empty string for null or undefined', () => {
    expect(formatODataKeys(null)).toBe('');
    expect(formatODataKeys(undefined)).toBe('');
  });
});

describe('formatODataQueryOptions', () => {
  it('should return empty string when no options are provided', () => {
    expect(formatODataQueryOptions()).toBe('');
  });

  it('should return empty string when options are empty', () => {
    expect(formatODataQueryOptions({})).toBe('');
  });

  it('should build query string with all supported options', () => {
    const query = formatODataQueryOptions({
      filter: "Name eq 'Bike'",
      select: ['No', 'Name'],
      expand: ['Category'],
      top: 20,
      skip: 5,
      orderby: 'Name asc',
      count: true,
      schemaversion: '2.1',
    });

    expect(query).toContain('$filter=Name+eq+%27Bike%27');
    expect(query).toContain('$select=No%2CName');
    expect(query).toContain('$expand=Category');
    expect(query).toContain('$top=20');
    expect(query).toContain('$skip=5');
    expect(query).toContain('$orderby=Name+asc');
    expect(query).toContain('$count=true');
    expect(query).toContain('$schemaversion=2.1');
  });

  it('should serialize BcFilter instances', () => {
    const filter = BcFilter.build().eq('No', '1000').and().eq('Blocked', false);

    const query = formatODataQueryOptions({ filter });

    expect(query).toContain('$filter=No+eq+%271000%27+and+Blocked+eq+false');
  });

  it('should serialize string filter directly', () => {
    const query = formatODataQueryOptions({ filter: "Status eq 'Open'" });

    expect(query).toContain('$filter=Status+eq+%27Open%27');
  });
});
