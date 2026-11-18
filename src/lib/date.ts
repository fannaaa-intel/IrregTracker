/**
 * A local calendar date, 'YYYY-MM-DD' (CLAUDE.md §3).
 * Not a JS Date and not a timestamp. All date math in the app goes through this file.
 *
 * Internally a LocalDate maps to a whole "epoch day" via UTC midnight, so adding days and
 * diffing never meet daylight-saving jumps or timezone offsets.
 */
export type LocalDate = string;

const PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 86_400_000;

function pad(value: number, width = 2): string {
  return String(value).padStart(width, '0');
}

function fromParts(year: number, month: number, day: number): LocalDate {
  return `${pad(year, 4)}-${pad(month)}-${pad(day)}`;
}

/** True when `value` is 'YYYY-MM-DD' and a real calendar date (e.g. not 2026-02-29). */
export function isLocalDate(value: string): boolean {
  const match = PATTERN.exec(value);
  if (match === null) return false;
  const [year, month, day] = match.slice(1).map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  return (
    utc.getUTCFullYear() === year && utc.getUTCMonth() === month - 1 && utc.getUTCDate() === day
  );
}

/** Validates a string as a LocalDate. Throws RangeError otherwise. */
export function parse(value: string): LocalDate {
  if (!isLocalDate(value)) {
    throw new RangeError(`Not a valid LocalDate: expected 'YYYY-MM-DD'.`);
  }
  return value;
}

function toEpochDay(date: LocalDate): number {
  const [year, month, day] = parse(date).split('-').map(Number);
  return Date.UTC(year, month - 1, day) / MS_PER_DAY;
}

function fromEpochDay(epochDay: number): LocalDate {
  const utc = new Date(epochDay * MS_PER_DAY);
  return fromParts(utc.getUTCFullYear(), utc.getUTCMonth() + 1, utc.getUTCDate());
}

export function addDays(date: LocalDate, days: number): LocalDate {
  if (!Number.isInteger(days)) {
    throw new RangeError('addDays needs a whole number of days.');
  }
  return fromEpochDay(toEpochDay(date) + days);
}

/** Whole days from `earlier` to `later` (negative if `later` is before `earlier`). */
export function diffDays(later: LocalDate, earlier: LocalDate): number {
  return toEpochDay(later) - toEpochDay(earlier);
}

/**
 * Today's date on the phone's own calendar. Uses local fields, never toISOString() (that is
 * UTC and can be a day off). `now` is a parameter so callers and tests can pin the time.
 */
export function todayLocal(now: Date = new Date()): LocalDate {
  return fromParts(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

/** Hour of day (0–23) on the phone's own clock. Not for health data: used for app update timing. */
export function localHour(now: Date = new Date()): number {
  return now.getHours();
}

/** Milliseconds since the epoch, for elapsed-time checks only (never for health dates). */
export function nowMs(): number {
  return Date.now();
}

/** Today's date plus the wall-clock hour and minute, for scheduling local reminders. */
export function localClock(now: Date = new Date()): {
  date: LocalDate;
  hour: number;
  minute: number;
} {
  return { date: todayLocal(now), hour: now.getHours(), minute: now.getMinutes() };
}

/** The moment `hour:minute` happens on `date` on the phone's clock (for notification triggers). */
export function atLocalTime(date: LocalDate, hour: number, minute = 0): Date {
  const [year, month, day] = parse(date).split('-').map(Number);
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

/** "8 AM", "6 PM" (or "18:00" style, depending on the device locale). */
export function formatHour(hour: number, locale?: string): string {
  return new Intl.DateTimeFormat(locale, { hour: 'numeric', timeZone: 'UTC' }).format(
    new Date(Date.UTC(2026, 0, 1, hour)),
  );
}

export type FormatOptions = {
  withYear?: boolean;
  /** 'short' → "Dec 3" (default), 'long' → "December 3". */
  month?: 'short' | 'long';
  withWeekday?: boolean;
  locale?: string;
};

/** Display text such as "Dec 3", "December 3, 2026" or "Thursday, December 3". */
export function format(
  date: LocalDate,
  { withYear = false, month = 'short', withWeekday = false, locale }: FormatOptions = {},
): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: withWeekday ? 'long' : undefined,
    month,
    day: 'numeric',
    year: withYear ? 'numeric' : undefined,
    timeZone: 'UTC',
  }).format(new Date(toEpochDay(date) * MS_PER_DAY));
}

/** Day of the week, 0 = Sunday … 6 = Saturday. */
export function weekday(date: LocalDate): number {
  return new Date(toEpochDay(date) * MS_PER_DAY).getUTCDay();
}

// ── Months ──────────────────────────────────────────────────────────────────────────

/** A calendar month; `month` is 1–12. */
export type Month = { year: number; month: number };

export function monthOf(date: LocalDate): Month {
  const [year, month] = parse(date).split('-').map(Number);
  return { year, month };
}

export function addMonths({ year, month }: Month, months: number): Month {
  const index = year * 12 + (month - 1) + months;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

export function firstDayOf({ year, month }: Month): LocalDate {
  return fromParts(year, month, 1);
}

export function daysInMonth({ year, month }: Month): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** "March 2026" in the device locale. */
export function formatMonth({ year, month }: Month, locale?: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}
