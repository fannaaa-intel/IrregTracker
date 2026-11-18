// Calendar logic (PLAN.md §7). Pure: plain data in, plain data out; `today` is passed in.
import {
  addDays,
  daysInMonth,
  diffDays,
  firstDayOf,
  format,
  weekday,
  type LocalDate,
  type Month,
} from '../../lib/date';
import type { Flow } from '../../theme';
import { deriveCycles, type CycleTag, type PeriodDayInput } from '../cycles/logic';
import { predictNextPeriod } from '../prediction/logic';

export type DateWindow = { start: LocalDate; end: LocalDate };

export type DayCell = {
  date: LocalDate;
  dayOfMonth: number;
  flow: Flow | null;
  isToday: boolean;
  /** Future days can't be logged. */
  isFuture: boolean;
  /** Inside the predicted window and not logged: drawn as the dashed band. */
  inWindow: boolean;
  selected: boolean;
};

/** Weeks start on Sunday; days outside the month are null. */
export type MonthGrid = { month: Month; weeks: (DayCell | null)[][] };

export const FLOWS: readonly Flow[] = ['spotting', 'light', 'medium', 'heavy'];

export const flowLabel: Record<Flow, string> = {
  spotting: 'Spotting',
  light: 'Light',
  medium: 'Medium',
  heavy: 'Heavy',
};

function isWithin(date: LocalDate, window: DateWindow | null): boolean {
  return window !== null && diffDays(date, window.start) >= 0 && diffDays(window.end, date) >= 0;
}

export function buildMonthGrid(
  month: Month,
  {
    flows,
    window,
    today,
    selected = new Set(),
  }: {
    flows: ReadonlyMap<LocalDate, Flow>;
    window: DateWindow | null;
    today: LocalDate;
    selected?: ReadonlySet<LocalDate>;
  },
): MonthGrid {
  const first = firstDayOf(month);
  const cells: (DayCell | null)[] = Array.from({ length: weekday(first) }, () => null);

  for (let i = 0; i < daysInMonth(month); i++) {
    const date = addDays(first, i);
    const flow = flows.get(date) ?? null;
    cells.push({
      date,
      dayOfMonth: i + 1,
      flow,
      isToday: date === today,
      isFuture: diffDays(date, today) > 0,
      inWindow: flow === null && isWithin(date, window),
      selected: selected.has(date),
    });
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (DayCell | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return { month, weeks };
}

/** Runs of consecutive in-window days in one week, as column ranges [from, to]. */
export function windowSegments(week: readonly (DayCell | null)[]): { from: number; to: number }[] {
  const segments: { from: number; to: number }[] = [];
  week.forEach((cell, column) => {
    if (cell?.inWindow !== true) return;
    const last = segments[segments.length - 1];
    if (last !== undefined && last.to === column - 1) last.to = column;
    else segments.push({ from: column, to: column });
  });
  return segments;
}

/** Screen-reader text, e.g. "March 3, today, period day, medium flow". */
export function dayLabel(cell: DayCell, locale?: string): string {
  const parts = [format(cell.date, { month: 'long', locale })];
  if (cell.isToday) parts.push('today');
  if (cell.flow === 'spotting') parts.push('spotting');
  else if (cell.flow !== null) parts.push('period day', `${cell.flow} flow`);
  else if (cell.inWindow) parts.push('in the likely period window');
  else parts.push('nothing logged');
  if (cell.selected) parts.push('selected');
  return parts.join(', ');
}

/** The predicted window to draw on the calendar, or null while still learning. */
export function predictedWindow(
  days: readonly PeriodDayInput[],
  tags: readonly CycleTag[],
  today: LocalDate,
): DateWindow | null {
  const prediction = predictNextPeriod(deriveCycles(days), tags, today);
  return prediction.state === 'window' ? prediction.window : null;
}

/** Weekday initials for the header row, Sunday first, in the device locale. */
export function weekdayInitials(locale?: string): string[] {
  const sunday = '2026-03-01';
  return Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(locale, { weekday: 'narrow', timeZone: 'UTC' }).format(
      new Date(`${addDays(sunday, i)}T00:00:00Z`),
    ),
  );
}
