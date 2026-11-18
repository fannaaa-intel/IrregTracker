// Next-period window + confidence (PLAN.md §6). Pure: pass `today` in.
// Always a window, never a single date (CLAUDE.md §2.1).
import { addDays, diffDays, type LocalDate } from '../../lib/date';
import { iqr, median, range, stdev } from '../../lib/stats';
import { countedCycles, type CycleHistory, type CycleTag } from '../cycles/logic';
import { MIN_CYCLES_FOR_PREDICTION } from '../flags/thresholds';

// Product rules from PLAN.md §6.
const MAX_CYCLES = 12;
const IQR_MIN_CYCLES = 4;
const MIN_SPREAD_WITH_IQR = 2;
const MIN_SPREAD_WITH_RANGE = 3;
const HIGH = { minCycles: 6, maxStdev: 3 };
const MEDIUM = { minCycles: 4, maxStdev: 7 };

export type Confidence = 'low' | 'medium' | 'high';

export type Prediction =
  | {
      state: 'learning';
      cyclesCounted: number;
      /** How many more complete cycles until a window can be shown. */
      cyclesNeeded: number;
    }
  | {
      state: 'window';
      /**
       * The window to show: "likely between start and end", both inclusive. Once she is past the
       * usual range with no new period logged, it moves forward to start today (like Clue and
       * Fitbit do), so it never points at days that have already gone by.
       */
      window: { start: LocalDate; end: LocalDate };
      /** The window from her history alone; equal to `window` until she is late. */
      usual: { start: LocalDate; end: LocalDate };
      confidence: Confidence;
      cyclesCounted: number;
      /** Days past the usual window's end with no new period logged; 0 when not late. */
      daysLate: number;
    };

function confidenceFor(lengths: readonly number[]): Confidence {
  const n = lengths.length;
  const spread = stdev(lengths);
  if (n >= HIGH.minCycles && spread <= HIGH.maxStdev) return 'high';
  if (n >= MEDIUM.minCycles && spread <= MEDIUM.maxStdev) return 'medium';
  return 'low';
}

function halfWidth(lengths: readonly number[]): number {
  if (lengths.length >= IQR_MIN_CYCLES) {
    return Math.max(Math.ceil(iqr(lengths) / 2), MIN_SPREAD_WITH_IQR);
  }
  return Math.max(Math.ceil(range(lengths) / 2), MIN_SPREAD_WITH_RANGE);
}

export function predictNextPeriod(
  history: CycleHistory,
  tags: readonly CycleTag[],
  today: LocalDate,
): Prediction {
  const lengths = countedCycles(history.closed, tags)
    .slice(0, MAX_CYCLES)
    .map((cycle) => cycle.length);

  if (lengths.length < MIN_CYCLES_FOR_PREDICTION || history.open === null) {
    return {
      state: 'learning',
      cyclesCounted: lengths.length,
      cyclesNeeded: Math.max(MIN_CYCLES_FOR_PREDICTION - lengths.length, 0),
    };
  }

  const center = median(lengths);
  const spread = halfWidth(lengths);
  const lastStart = history.open.start;
  // The median can be a half day; round outward so the window is never narrower than the rule.
  const usual = {
    start: addDays(lastStart, Math.floor(center - spread)),
    end: addDays(lastStart, Math.ceil(center + spread)),
  };
  const daysLate = Math.max(diffDays(today, usual.end), 0);
  if (daysLate === 0) {
    return {
      state: 'window',
      window: usual,
      usual,
      confidence: confidenceFor(lengths),
      cyclesCounted: lengths.length,
      daysLate,
    };
  }

  // Late: keep the same width, starting today. Her history no longer explains this cycle,
  // so confidence drops to low until the next period is logged.
  const width = diffDays(usual.end, usual.start);
  return {
    state: 'window',
    window: { start: today, end: addDays(today, width) },
    usual,
    confidence: 'low',
    cyclesCounted: lengths.length,
    daysLate,
  };
}
