import { describe, expect, it } from 'vitest';
import { BcFilter } from './filter-builder.js';

describe('BcFilter', () => {
  it('should build a simple equality filter', () => {
    const filter = new BcFilter().eq('displayName', 'Santi');
    expect(filter.toString()).toBe("displayName eq 'Santi'");
  });

  it('should handle numbers and booleans correctly', () => {
    const filter = new BcFilter().eq('amount', 100).and().eq('active', true);
    expect(filter.toString()).toBe('amount eq 100 and active eq true');
  });

  it('should handle logical OR correctly', () => {
    const filter = new BcFilter().eq('status', 'Open').or().eq('status', 'Pending');
    expect(filter.toString()).toBe("status eq 'Open' or status eq 'Pending'");
  });

  it('should group conditions with parentheses', () => {
    const subFilter = new BcFilter().eq('city', 'Madrid').or().eq('city', 'BCN');
    const filter = new BcFilter().eq('country', 'ES').and().group(subFilter);

    expect(filter.toString()).toBe("country eq 'ES' and (city eq 'Madrid' or city eq 'BCN')");
  });

  it('should handle between dates/numbers', () => {
    const filter = new BcFilter().between('price', 10, 50);
    expect(filter.toString()).toBe('(price ge 10 and price le 50)');
  });

  it('should support in operator', () => {
    const filter = new BcFilter().in('code', ['A', 'B', 'C']);
    expect(filter.toString()).toBe("code in ('A','B','C')");
  });

  it('should support substring functions', () => {
    const f1 = new BcFilter().contains('description', 'bike');
    expect(f1.toString()).toBe("contains(description, 'bike')");

    const f2 = new BcFilter().startsWith('code', 'P-');
    expect(f2.toString()).toBe("startswith(code, 'P-')");

    const f3 = new BcFilter().endsWith('type', 'Item');
    expect(f3.toString()).toBe("endswith(type, 'Item')");
  });

  it('should support comparison operators', () => {
    const filter = new BcFilter()
      .gt('price', 100)
      .ge('stock', 0)
      .lt('weight', 500)
      .le('height', 10);

    expect(filter.toString()).toBe(
      'price gt 100 and stock ge 0 and weight lt 500 and height le 10',
    );
  });

  it('should support case conversion functions', () => {
    const filter = new BcFilter();
    expect(filter.toLower('Name')).toBe('tolower(Name)');
    expect(filter.toUpper('Name')).toBe('toupper(Name)');
  });

  it('should support raw filter strings', () => {
    const filter = new BcFilter().raw("MyCustomFunction(field, 'val')");
    expect(filter.toString()).toBe("MyCustomFunction(field, 'val')");
  });

  it('should support not-equal and null values', () => {
    const filter = new BcFilter().ne('blockedBy', null);
    expect(filter.toString()).toBe('blockedBy ne null');
  });

  it('should ignore in operator when values are empty', () => {
    const filter = new BcFilter().in('code', []);
    expect(filter.toString()).toBe('');
  });

  it('should serialize dates to ISO string', () => {
    const date = new Date('2026-02-13T10:00:00.000Z');
    const filter = new BcFilter().ge('modifiedAt', date);
    expect(filter.toString()).toBe(`modifiedAt ge ${date.toISOString()}`);
  });

  describe('toChunks', () => {
    it('returns [this] when no IN condition exists', () => {
      const f = BcFilter.build().eq('Status', 'Open');
      const chunks = f.toChunks(2);
      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toBe(f);
    });

    it('returns [this] when values fit within chunkSize', () => {
      const f = BcFilter.build().in('No', ['A', 'B']);
      const chunks = f.toChunks(5);
      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toBe(f);
    });

    it('splits values into multiple chunks', () => {
      const f = BcFilter.build().in('No', ['A', 'B', 'C', 'D', 'E']);
      const chunks = f.toChunks(2);
      expect(chunks).toHaveLength(3);
      expect(chunks[0]!.toString()).toBe("No in ('A','B')");
      expect(chunks[1]!.toString()).toBe("No in ('C','D')");
      expect(chunks[2]!.toString()).toBe("No in ('E')");
    });

    it('preserves other conditions when chunking', () => {
      const f = BcFilter.build().eq('Type', 'Inventory').in('No', ['A', 'B', 'C']);
      const chunks = f.toChunks(2);
      expect(chunks).toHaveLength(2);
      expect(chunks[0]!.toString()).toBe("Type eq 'Inventory' and No in ('A','B')");
      expect(chunks[1]!.toString()).toBe("Type eq 'Inventory' and No in ('C')");
    });

    it('handles numeric values', () => {
      const f = BcFilter.build().in('Amount', [1, 2, 3]);
      const chunks = f.toChunks(2);
      expect(chunks).toHaveLength(2);
      expect(chunks[0]!.toString()).toBe('Amount in (1,2)');
      expect(chunks[1]!.toString()).toBe('Amount in (3)');
    });
  });
});
