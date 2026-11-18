import { addDays, diffDays, format, isLocalDate, parse, todayLocal } from './date';

describe('isLocalDate / parse', () => {
  it.each(['2026-01-01', '2026-12-31', '2028-02-29'])('accepts %s', (value) => {
    expect(isLocalDate(value)).toBe(true);
    expect(parse(value)).toBe(value);
  });

  it.each([
    '2026-02-29',
    '2026-13-01',
    '2026-04-31',
    '2026-1-01',
    '26-01-01',
    '2026-01-01T00:00',
    '',
  ])('rejects %p', (value) => {
    expect(isLocalDate(value)).toBe(false);
    expect(() => parse(value)).toThrow(RangeError);
  });
});

describe('addDays', () => {
  it('moves across month, year and leap-day boundaries', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01');
  });

  it('goes backwards with negative days and is unchanged with zero', () => {
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(addDays('2026-03-01', 0)).toBe('2026-03-01');
  });

  it('is not affected by daylight-saving changes', () => {
    // US and EU clocks change in March and October/November; days must still be whole.
    expect(addDays('2026-03-07', 2)).toBe('2026-03-09');
    expect(addDays('2026-10-24', 2)).toBe('2026-10-26');
  });

  it('rejects fractional days and invalid dates', () => {
    expect(() => addDays('2026-03-01', 1.5)).toThrow(RangeError);
    expect(() => addDays('2026-02-30', 1)).toThrow(RangeError);
  });
});

describe('diffDays', () => {
  it('counts whole days between two dates', () => {
    expect(diffDays('2026-03-29', '2026-03-01')).toBe(28);
    expect(diffDays('2027-01-01', '2026-01-01')).toBe(365);
    expect(diffDays('2029-01-01', '2028-01-01')).toBe(366);
  });

  it('is negative when the first date is earlier, and zero for the same day', () => {
    expect(diffDays('2026-03-01', '2026-03-29')).toBe(-28);
    expect(diffDays('2026-03-01', '2026-03-01')).toBe(0);
  });

  it('round-trips with addDays', () => {
    expect(diffDays(addDays('2026-05-10', 41), '2026-05-10')).toBe(41);
  });
});

describe('todayLocal', () => {
  it("uses the phone's local calendar day, even just after midnight or before it", () => {
    expect(todayLocal(new Date(2026, 0, 1, 0, 5))).toBe('2026-01-01');
    expect(todayLocal(new Date(2026, 0, 31, 23, 59))).toBe('2026-01-31');
  });
});

describe('format', () => {
  it('shows a short month and day, optionally with the year', () => {
    expect(format('2026-12-03', { locale: 'en-US' })).toBe('Dec 3');
    expect(format('2026-12-03', { locale: 'en-US', withYear: true })).toBe('Dec 3, 2026');
  });
});
