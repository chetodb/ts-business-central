import { describe, expect, it } from 'vitest';
import { dateAddSeconds, dateFormat, dateIsBefore } from './date.utils.js';

describe('date utils', () => {
  it('dateIsBefore should return true when date is before comparison date', () => {
    const d1 = new Date(2026, 1, 13, 9, 0, 0);
    const d2 = new Date(2026, 1, 13, 10, 0, 0);

    expect(dateIsBefore(d1, d2)).toBe(true);
    expect(dateIsBefore(d2, d1)).toBe(false);
  });

  it('dateAddSeconds should add seconds correctly', () => {
    const start = new Date(2026, 1, 13, 9, 0, 0);

    const result = dateAddSeconds(start, 90);

    expect(result.getTime()).toBe(start.getTime() + 90_000);
  });

  it("dateFormat should format as 'HH:mm dd/MM/yyyy'", () => {
    const date = new Date(2026, 1, 13, 9, 5, 0);

    expect(dateFormat(date)).toBe('09:05 13/02/2026');
  });
});
