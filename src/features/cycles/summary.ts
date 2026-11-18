// History stats and the cycle ring (PLAN.md §7). Pure functions.
import { diffDays, type LocalDate } from '../../lib/date';
import { median, range } from '../../lib/stats';
import type { Prediction } from '../prediction/logic';
import { cycleDay, type ClosedCycle, type OpenCycle } from './logic';

/** Stats cover the same recent cycles as the prediction and the chart. */
export const RECENT_CYCLES = 12;

export type CycleSummary = {
  count: number;
  /** Median cycle length, rounded to whole days. */
  typical: number;
  shortest: number;
  longest: number;
  /** longest − shortest. */
  variation: number;
  /** Median period length, rounded. */
  typicalPeriod: number;
};

/** Summary of counted cycles (newest first), or null when there are none. */
export function summarizeCycles(counted: readonly ClosedCycle[]): CycleSummary | null {
  const recent = counted.slice(0, RECENT_CYCLES);
  if (recent.length === 0) return null;
  const lengths = recent.map((cycle) => cycle.length);
  return {
    count: recent.length,
    typical: Math.round(median(lengths)),
    shortest: Math.min(...lengths),
    longest: Math.max(...lengths),
    variation: range(lengths),
    typicalPeriod: Math.round(median(recent.map((cycle) => cycle.period.length))),
  };
}

export type RingModel = {
  /** "Day X of cycle". */
  day: number;
  /** Fraction of the ring filled by the current cycle (0–1), or null while there's no scale yet. */
  progress: number | null;
  /** The predicted window as ring fractions, or null while still learning. */
  window: { from: number; to: number } | null;
  /** "of usually 26–30": the window as cycle lengths in days. */
  usual: { min: number; max: number } | null;
};

/**
 * The ring is scaled to the end of the predicted window (or to today, if later), so the
 * window arc always fits. While learning, it scales to the typical length if one exists.
 */
export function ringModel(
  open: OpenCycle,
  prediction: Prediction,
  today: LocalDate,
  typicalLength: number | null,
): RingModel | null {
  const day = cycleDay(open, today);
  if (day === null) return null;

  if (prediction.state === 'window') {
    // The usual range, not the moved-forward window: "of usually 26–34" stays true when late.
    const from = diffDays(prediction.usual.start, open.start);
    const to = diffDays(prediction.usual.end, open.start);
    const total = Math.max(to, day);
    return {
      day,
      progress: Math.min(day / total, 1),
      window: { from: from / total, to: to / total },
      usual: { min: from, max: to },
    };
  }

  const total = typicalLength === null ? null : Math.max(typicalLength, day);
  return { day, progress: total === null ? null : day / total, window: null, usual: null };
}
