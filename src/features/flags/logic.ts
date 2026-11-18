// Gentle health notes (PLAN.md §6, docs/HEALTH_RULES.md). Pure: pass `today` in.
// These are notes, not alerts or diagnoses (CLAUDE.md §2.3–2.4); wording lives in the UI.
import { diffDays, type LocalDate } from '../../lib/date';
import { range } from '../../lib/stats';
import { countedCycles, type CycleHistory, type CycleTag } from '../cycles/logic';
import {
  LONG_CYCLE_FLAG,
  LONG_PERIOD_FLAG,
  MIN_CYCLES_FOR_PREDICTION,
  NO_PERIOD_DAYS,
  SHORT_CYCLE_FLAG,
  VARIATION_FLAG,
} from './thresholds';

/** Variation is measured across this many recent counted cycles (PLAN.md §6). */
export const VARIATION_WINDOW = 6;

export type FlagType =
  'no-period' | 'long-period' | 'short-cycle' | 'long-cycle' | 'high-variation';

export type HealthFlag = {
  type: FlagType;
  /** Stable per occurrence (type + cycle start), so a dismissed card stays dismissed. */
  id: string;
  /** The "X days" in the card text. */
  days: number;
};

function flag(type: FlagType, cycleStart: LocalDate, days: number): HealthFlag {
  return { type, id: `${type}:${cycleStart}`, days };
}

/**
 * All flags that apply today, most important first. Home shows one at a time.
 * - no-period: NO_PERIOD_DAYS+ since the last period started
 * - long-period: the latest period lasted LONG_PERIOD_FLAG+ days
 * - short/long-cycle: the latest closed cycle (skipped while it awaits confirmation)
 * - high-variation: max − min across the last 6 counted cycles; needs at least
 *   MIN_CYCLES_FOR_PREDICTION of them, because the card explains the prediction window
 */
export function detectFlags(
  history: CycleHistory,
  tags: readonly CycleTag[],
  today: LocalDate,
): HealthFlag[] {
  const flags: HealthFlag[] = [];
  const { open } = history;

  if (open !== null) {
    const sinceStart = diffDays(today, open.start);
    if (sinceStart >= NO_PERIOD_DAYS) flags.push(flag('no-period', open.start, sinceStart));
    if (open.period.length >= LONG_PERIOD_FLAG) {
      flags.push(flag('long-period', open.start, open.period.length));
    }
  }

  const latest = history.closed[0];
  if (latest !== undefined && !latest.needsConfirmation) {
    if (latest.length <= SHORT_CYCLE_FLAG) {
      flags.push(flag('short-cycle', latest.start, latest.length));
    }
    if (latest.length >= LONG_CYCLE_FLAG) {
      flags.push(flag('long-cycle', latest.start, latest.length));
    }
  }

  const recent = countedCycles(history.closed, tags).slice(0, VARIATION_WINDOW);
  if (recent.length >= MIN_CYCLES_FOR_PREDICTION) {
    const variation = range(recent.map((cycle) => cycle.length));
    if (variation >= VARIATION_FLAG) {
      flags.push(flag('high-variation', recent[0].start, variation));
    }
  }

  return flags;
}

/** The one card Home shows: the most important flag she hasn't dismissed, or null. */
export function pickFlag(
  flags: readonly HealthFlag[],
  dismissed: readonly string[],
): HealthFlag | null {
  const hidden = new Set(dismissed);
  return flags.find((f) => !hidden.has(f.id)) ?? null;
}
