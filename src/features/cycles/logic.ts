// Cycle derivation (PLAN.md §5). Pure: plain data in, plain data out. Cycles are never stored.
import { diffDays, type LocalDate } from '../../lib/date';
import type { Flow } from '../../theme';
import { IMPLAUSIBLE_CYCLE, PERIOD_MERGE_GAP } from '../flags/thresholds';

export type PeriodDayInput = { date: LocalDate; flow: Flow };

export type Period = {
  /** First non-spotting day: day 1 of the cycle. */
  start: LocalDate;
  /** Last logged day of the period (trailing spotting included). */
  end: LocalDate;
  /** Days from start to end, inclusive. */
  length: number;
};

export type ClosedCycle = {
  start: LocalDate;
  nextStart: LocalDate;
  /** nextStart − start, in days. */
  length: number;
  period: Period;
  /** Shorter than IMPLAUSIBLE_CYCLE and not confirmed yet: shown, but not counted. */
  needsConfirmation: boolean;
};

export type OpenCycle = {
  start: LocalDate;
  period: Period;
};

export type CycleHistory = {
  /** Newest first. */
  closed: ClosedCycle[];
  /** The current cycle, or null when nothing (non-spotting) has been logged. */
  open: OpenCycle | null;
};

export type CycleTag = { cycleStart: LocalDate; exclude: boolean };

/** Groups logged days into periods. Days with ≤ PERIOD_MERGE_GAP unlogged days between merge. */
function groupDays(days: readonly PeriodDayInput[]): PeriodDayInput[][] {
  const byDate = new Map(days.map((day) => [day.date, day]));
  const sorted = [...byDate.values()].sort((a, b) => (a.date < b.date ? -1 : 1));
  const groups: PeriodDayInput[][] = [];
  for (const day of sorted) {
    const group = groups[groups.length - 1];
    const previous = group?.[group.length - 1];
    if (previous !== undefined && diffDays(day.date, previous.date) - 1 <= PERIOD_MERGE_GAP) {
      group.push(day);
    } else {
      groups.push([day]);
    }
  }
  return groups;
}

/** Periods oldest first. Spotting-only groups are dropped: they never start a cycle. */
export function derivePeriods(days: readonly PeriodDayInput[]): Period[] {
  const periods: Period[] = [];
  for (const group of groupDays(days)) {
    const firstFlow = group.find((day) => day.flow !== 'spotting');
    if (firstFlow === undefined) continue;
    const end = group[group.length - 1].date;
    periods.push({ start: firstFlow.date, end, length: diffDays(end, firstFlow.date) + 1 });
  }
  return periods;
}

export function deriveCycles(
  days: readonly PeriodDayInput[],
  { confirmedShortCycles = [] }: { confirmedShortCycles?: readonly LocalDate[] } = {},
): CycleHistory {
  const periods = derivePeriods(days);
  if (periods.length === 0) return { closed: [], open: null };

  const confirmed = new Set(confirmedShortCycles);
  const closed: ClosedCycle[] = [];
  for (let i = 0; i < periods.length - 1; i++) {
    const period = periods[i];
    const nextStart = periods[i + 1].start;
    const length = diffDays(nextStart, period.start);
    closed.push({
      start: period.start,
      nextStart,
      length,
      period,
      needsConfirmation: length < IMPLAUSIBLE_CYCLE && !confirmed.has(period.start),
    });
  }

  const last = periods[periods.length - 1];
  return { closed: closed.reverse(), open: { start: last.start, period: last } };
}

/**
 * Closed cycles that count toward predictions and variation, newest first: not tagged
 * "exclude", and not waiting for a short-cycle confirmation.
 */
export function countedCycles(
  closed: readonly ClosedCycle[],
  tags: readonly CycleTag[],
): ClosedCycle[] {
  const excluded = new Set(tags.filter((tag) => tag.exclude).map((tag) => tag.cycleStart));
  return closed.filter((cycle) => !cycle.needsConfirmation && !excluded.has(cycle.start));
}

/** "Day X of cycle": day 1 is the period start. Null before the start or with no open cycle. */
export function cycleDay(open: OpenCycle | null, today: LocalDate): number | null {
  if (open === null) return null;
  const day = diffDays(today, open.start) + 1;
  return day >= 1 ? day : null;
}
