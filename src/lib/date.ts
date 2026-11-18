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

/** Display text such as "Dec 3" (or "Dec 3, 2026"). Defaults to the device locale. */
export function format(
  date: LocalDate,
  { withYear = false, locale }: { withYear?: boolean; locale?: string } = {},
): string {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: withYear ? 'numeric' : undefined,
    timeZone: 'UTC',
  }).format(new Date(toEpochDay(date) * MS_PER_DAY));
}
