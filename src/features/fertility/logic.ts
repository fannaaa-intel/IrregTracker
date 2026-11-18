// Possible fertile days and likely ovulation days (owner decision, Nov 18, 2026).
// Pure: plain data in, plain data out. Always ranges, never a single day. Not contraception.
// Method, limits and sources: docs/HEALTH_RULES.md → "Fertile days and ovulation".
import { addDays, type LocalDate } from '../../lib/date';
import { median } from '../../lib/stats';
import { countedCycles, type CycleHistory, type CycleTag } from '../cycles/logic';
import {
  FERTILE_CYCLES,
  FERTILE_FROM_LONGEST,
  FERTILE_FROM_SHORTEST,
  MIN_CYCLES_FOR_PREDICTION,
  OVULATION_EARLY,
  OVULATION_LATE,
  VARIATION_FLAG,
} from '../flags/thresholds';
import type { Prediction } from '../prediction/logic';
import { positiveTestThisCycle, rangesFromTest, type TestResult } from './tests';

export type DayRange = { start: LocalDate; end: LocalDate };

export type FertileEstimate = {
  /** Days with a higher chance of pregnancy (calendar method), both inclusive. */
  fertile: DayRange;
  /** Ovulation happens on one of these days (typical cycle − a 12–16 day luteal phase). */
  ovulation: DayRange;
  cyclesUsed: number;
  /** Fewer than FERTILE_CYCLES cycles behind it: say "rough estimate". */
  rough: boolean;
  /** 'test' = from her positive ovulation test this cycle (more reliable than past cycles). */
  source: 'cycles' | 'test';
  /** The positive test day, when source is 'test'. */
  testDate?: LocalDate;
};

/**
 * Why there is (or isn't) an estimate:
 * - shown: cycles are regular enough for calendar math
 * - learning: fewer than 3 counted cycles
 * - late: this cycle has gone past the usual range, so it no longer matches her history
 * - irregular: recent cycles vary by VARIATION_FLAG+ days. Calendar math would then cover most
 *   of the cycle, and guidance says it isn't suitable for irregular cycles, so none is shown.
 */
export type FertileStatus =
  | { state: 'shown'; estimate: FertileEstimate }
  | { state: 'learning' }
  | { state: 'late' }
  | { state: 'irregular'; variation: number };

export function fertileStatus(
  history: CycleHistory,
  tags: readonly CycleTag[],
  prediction: Prediction,
  tests: readonly { date: LocalDate; result: TestResult }[] = [],
): FertileStatus {
  const open = history.open;
  const lengths = countedCycles(history.closed, tags)
    .slice(0, FERTILE_CYCLES)
    .map((cycle) => cycle.length);

  // A positive ovulation test this cycle beats calendar math, even for irregular or late cycles.
  const positive = positiveTestThisCycle(open, tests);
  if (open !== null && positive !== null) {
    return {
      state: 'shown',
      estimate: {
        ...rangesFromTest(positive, open.start),
        cyclesUsed: lengths.length,
        rough: false,
        source: 'test',
        testDate: positive,
      },
    };
  }

  if (
    open === null ||
    prediction.state !== 'window' ||
    lengths.length < MIN_CYCLES_FOR_PREDICTION
  ) {
    return { state: 'learning' };
  }
  const shortest = Math.min(...lengths);
  const longest = Math.max(...lengths);
  if (longest - shortest >= VARIATION_FLAG) {
    return { state: 'irregular', variation: longest - shortest };
  }
  if (prediction.daysLate > 0) return { state: 'late' };

  const typical = Math.round(median(lengths));
  // Cycle day 1 is the period start; very short cycles clamp to day 1.
  const onCycleDay = (day: number) => addDays(open.start, Math.max(day, 1) - 1);
  return {
    state: 'shown',
    estimate: {
      fertile: {
        start: onCycleDay(shortest - FERTILE_FROM_SHORTEST),
        end: onCycleDay(longest - FERTILE_FROM_LONGEST),
      },
      ovulation: {
        start: onCycleDay(typical - OVULATION_EARLY),
        end: onCycleDay(typical - OVULATION_LATE),
      },
      cyclesUsed: lengths.length,
      rough: lengths.length < FERTILE_CYCLES,
      source: 'cycles',
    },
  };
}

/** The estimate when one can honestly be shown, otherwise null. */
export function estimateFertileDays(
  history: CycleHistory,
  tags: readonly CycleTag[],
  prediction: Prediction,
): FertileEstimate | null {
  const status = fertileStatus(history, tags, prediction);
  return status.state === 'shown' ? status.estimate : null;
}

/** Whether `date` falls inside `range` (both ends inclusive). LocalDate strings sort by date. */
export function inRange(date: LocalDate, range: DayRange | null): boolean {
  return range !== null && date >= range.start && date <= range.end;
}
