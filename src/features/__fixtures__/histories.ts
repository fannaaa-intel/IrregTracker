// Made-up period histories shared by all logic tests (CLAUDE.md §7.3). Never real data.
// Each history is built from its closed cycle lengths so expected values are easy to read.
import { addDays, type LocalDate } from '../../lib/date';
import type { Flow } from '../../theme';
import type { PeriodDayInput } from '../cycles/logic';

export type HistoryFixture = {
  days: PeriodDayInput[];
  /** Closed cycle lengths, oldest first. */
  cycleLengths: number[];
  /** Period start dates, oldest first. The last one opens the current cycle. */
  starts: LocalDate[];
  lastStart: LocalDate;
};

const FLOW_PATTERN: readonly Flow[] = ['medium', 'heavy', 'medium', 'light'];
const FIRST_START: LocalDate = '2025-01-06';

function periodDays(start: LocalDate, length: number): PeriodDayInput[] {
  return Array.from({ length }, (_, i) => ({
    date: addDays(start, i),
    flow: FLOW_PATTERN[i] ?? 'light',
  }));
}

export function buildHistory(
  cycleLengths: number[],
  { periodLength = 5, lastPeriodLength }: { periodLength?: number; lastPeriodLength?: number } = {},
): HistoryFixture {
  const starts: LocalDate[] = [FIRST_START];
  for (const length of cycleLengths) {
    starts.push(addDays(starts[starts.length - 1], length));
  }
  const days = starts.flatMap((start, i) =>
    periodDays(start, i === starts.length - 1 ? (lastPeriodLength ?? periodLength) : periodLength),
  );
  return { days, cycleLengths, starts, lastStart: starts[starts.length - 1] };
}

/** Adds spotting 2 days before each period (merges into it) and 2 mid-cycle spotting-only days. */
function withSpotting(history: HistoryFixture): HistoryFixture {
  const spotting = history.starts.flatMap((start) =>
    [-2, 14, 15].map((offset): PeriodDayInput => ({
      date: addDays(start, offset),
      flow: 'spotting',
    })),
  );
  return { ...history, days: [...history.days, ...spotting] };
}

// The six histories from PLAN.md §10.
export const regular = buildHistory([28, 29, 28, 27, 28, 29, 28]);
export const irregular = buildHistory([31, 38, 34, 29, 36, 33, 40, 32]);
export const veryIrregular = buildHistory([24, 45, 31, 52, 28, 39]);
export const oneLongGap = buildHistory([29, 30, 95, 31, 28]);
export const lotsOfSpotting = withSpotting(buildHistory([30, 27, 32, 29]));
export const onlyTwoCycles = buildHistory([30, 33]);

// Boundary builders: one value varies, everything else stays regular.

/** Five steady 28-day cycles, then a latest closed cycle of `length` days. */
export function latestCycleOf(length: number): HistoryFixture {
  return buildHistory([28, 29, 28, 27, 28, length]);
}

/** A regular history whose most recent period lasts `days` days. */
export function latestPeriodOf(days: number): HistoryFixture {
  return buildHistory([28, 29, 28, 27, 28], { lastPeriodLength: days });
}

/** `count` identical cycles of `length` days. */
export function steadyCycles(count: number, length = 28): HistoryFixture {
  return buildHistory(Array.from({ length: count }, () => length));
}

/** Two logged days with `gap` unlogged days between them. */
export function twoDaysWithGap(gap: number): PeriodDayInput[] {
  return [
    { date: '2026-03-01', flow: 'medium' },
    { date: addDays('2026-03-01', gap + 1), flow: 'light' },
  ];
}
