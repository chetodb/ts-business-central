import { describe, expect, it } from 'vitest';
import { mergeOptions } from './config.utils.js';

describe('mergeOptions', () => {
  it('should merge base and overrides', () => {
    const base = { duration: false, showPaginationProgress: false };
    const overrides = { duration: true };

    const result = mergeOptions(base, overrides);

    expect(result).toEqual({ duration: true, showPaginationProgress: false });
  });

  it('should return base when overrides are not provided', () => {
    const base = { duration: false, showPaginationProgress: true };

    const result = mergeOptions(base);

    expect(result).toEqual(base);
  });
});
