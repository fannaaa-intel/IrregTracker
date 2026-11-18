import {
  addDays,
  addMonths,
  daysInMonth,
  diffDays,
  firstDayOf,
  format,
  formatMonth,
  isLocalDate,
  monthOf,
  parse,
  todayLocal,
  weekday,
} from './date';

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

  it('can show the long month and the weekday', () => {
    expect(format('2026-12-03', { locale: 'en-US', month: 'long' })).toBe('December 3');
    expect(format('2026-12-03', { locale: 'en-US', month: 'long', withWeekday: true })).toBe(
      'Thursday, December 3',
    );
  });
});

describe('weekday', () => {
  it('is 0 for Sunday through 6 for Saturday', () => {
    expect(weekday('2026-03-01')).toBe(0); // Sunday
    expect(weekday('2026-03-07')).toBe(6); // Saturday
    expect(weekday('2028-02-29')).toBe(2); // Tuesday
  });
});

describe('months', () => {
  it('finds the month of a date and its first day', () => {
    expect(monthOf('2026-03-18')).toEqual({ year: 2026, month: 3 });
    expect(firstDayOf({ year: 2026, month: 3 })).toBe('2026-03-01');
  });

  it('adds months across year boundaries, both ways', () => {
    expect(addMonths({ year: 2026, month: 12 }, 1)).toEqual({ year: 2027, month: 1 });
    expect(addMonths({ year: 2026, month: 1 }, -1)).toEqual({ year: 2025, month: 12 });
    expect(addMonths({ year: 2026, month: 5 }, -17)).toEqual({ year: 2024, month: 12 });
  });

  it('knows how many days each month has, including leap Februaries', () => {
    expect(daysInMonth({ year: 2026, month: 2 })).toBe(28);
    expect(daysInMonth({ year: 2028, month: 2 })).toBe(29);
    expect(daysInMonth({ year: 2026, month: 4 })).toBe(30);
    expect(daysInMonth({ year: 2026, month: 12 })).toBe(31);
  });

  it('formats a month title', () => {
    expect(formatMonth({ year: 2026, month: 3 }, 'en-US')).toBe('March 2026');
  });
});
