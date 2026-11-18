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

export type DateWindow = { start: LocalDate; end: LocalDate };

/** Possible fertile days, with likely ovulation days inside them (features/fertility). */
export type FertileDays = { fertile: DateWindow; ovulation: DateWindow };

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
  /** Estimate only: drawn as a soft solid band, ovulation days also get a flower mark. */
  fertility?: 'fertile' | 'ovulation' | null;
  /** Sex logged that day: a small heart. */
  hasIntimacy?: boolean;
  /** Any symptom logged that day: a small ring. */
  hasSymptoms?: boolean;
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
    fertile = null,
    intimacy = new Set(),
    symptoms = new Set(),
  }: {
    flows: ReadonlyMap<LocalDate, Flow>;
    window: DateWindow | null;
    today: LocalDate;
    selected?: ReadonlySet<LocalDate>;
    fertile?: FertileDays | null;
    intimacy?: ReadonlySet<LocalDate>;
    symptoms?: ReadonlySet<LocalDate>;
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
      // Never on logged period days: an estimate shouldn't sit on top of what she logged.
      fertility:
        flow !== null
          ? null
          : isWithin(date, fertile?.ovulation ?? null)
            ? 'ovulation'
            : isWithin(date, fertile?.fertile ?? null)
              ? 'fertile'
              : null,
      hasIntimacy: intimacy.has(date),
      hasSymptoms: symptoms.has(date),
    });
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (DayCell | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return { month, weeks };
}

type Segment = { from: number; to: number };

/** Runs of consecutive in-window days in one week, as column ranges [from, to]. */
export function windowSegments(week: readonly (DayCell | null)[]): Segment[] {
  return segmentsWhere(week, (cell) => cell.inWindow);
}

/** Runs of consecutive possible fertile days (ovulation days included) in one week. */
export function fertileSegments(week: readonly (DayCell | null)[]): Segment[] {
  return segmentsWhere(week, (cell) => cell.fertility != null);
}

function segmentsWhere(
  week: readonly (DayCell | null)[],
  matches: (cell: DayCell) => boolean,
): Segment[] {
  const segments: Segment[] = [];
  week.forEach((cell, column) => {
    if (cell === null || !matches(cell)) return;
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
  if (cell.fertility === 'ovulation') parts.push('possible fertile day', 'likely ovulation');
  else if (cell.fertility === 'fertile') parts.push('possible fertile day');
  if (cell.hasSymptoms === true) parts.push('symptoms logged');
  if (cell.hasIntimacy === true) parts.push('sex logged');
  if (parts.length === (cell.isToday ? 2 : 1)) parts.push('nothing logged');
  if (cell.selected) parts.push('selected');
  return parts.join(', ');
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

/**
 * What an estimate says about one day, in plain words for the top of the day editor, so a band
 * or flower on the calendar is never a guess. Empty for ordinary days.
 */
export function dayContext(
  date: LocalDate,
  { window, fertile }: { window: DateWindow | null; fertile: FertileDays | null },
): string[] {
  const lines: string[] = [];
  if (isWithin(date, window)) {
    lines.push('Your next period will likely start on one of these days. An estimate.');
  }
  if (isWithin(date, fertile?.ovulation ?? null)) {
    lines.push(
      'Likely ovulation: it happens on just one day, most likely one of these. An estimate.',
    );
  } else if (isWithin(date, fertile?.fertile ?? null)) {
    lines.push(
      'Possible fertile day: a higher chance of pregnancy. An estimate, not contraception.',
    );
  }
  return lines;
}
