import { describe, expect, it } from 'vitest';
import { withIfMatchHeader } from './http.utils.js';

describe('withIfMatchHeader', () => {
  it('should add If-Match header when missing', () => {
    const result = withIfMatchHeader({ headers: { Authorization: 'Bearer abc' } });

    expect(result.headers).toEqual({ Authorization: 'Bearer abc', 'If-Match': '*' });
  });

  it('should preserve existing If-Match header (case insensitive)', () => {
    const result = withIfMatchHeader({ headers: { 'if-match': 'W/"etag"' } });

    expect(result.headers).toEqual({ 'if-match': 'W/"etag"' });
  });

  it('should create headers object when requestOptions is undefined', () => {
    const result = withIfMatchHeader();

    expect(result.headers).toEqual({ 'If-Match': '*' });
  });
});
