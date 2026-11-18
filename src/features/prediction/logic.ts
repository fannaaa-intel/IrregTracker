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
      /** "Likely between start and end", both inclusive. */
      window: { start: LocalDate; end: LocalDate };
      confidence: Confidence;
      cyclesCounted: number;
      /** Days past the window's end with no new period logged; 0 when not late. */
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
  const start = addDays(lastStart, Math.floor(center - spread));
  const end = addDays(lastStart, Math.ceil(center + spread));

  return {
    state: 'window',
    window: { start, end },
    confidence: confidenceFor(lengths),
    cyclesCounted: lengths.length,
    daysLate: Math.max(diffDays(today, end), 0),
  };
}
