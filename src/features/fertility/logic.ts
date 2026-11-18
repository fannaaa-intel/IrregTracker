// Possible fertile days and likely ovulation days (owner decision, Nov 18, 2026).
// Pure: plain data in, plain data out. Always ranges, never a single day. Not contraception.
// Method and sources: docs/HEALTH_RULES.md → "Fertile days and ovulation".
import { addDays, type LocalDate } from '../../lib/date';
import { countedCycles, type CycleHistory, type CycleTag } from '../cycles/logic';
import {
  FERTILE_CYCLES,
  FERTILE_FROM_LONGEST,
  FERTILE_FROM_SHORTEST,
  MIN_CYCLES_FOR_PREDICTION,
  OVULATION_FROM_LONGEST,
  OVULATION_FROM_SHORTEST,
} from '../flags/thresholds';
import type { Prediction } from '../prediction/logic';

export type DayRange = { start: LocalDate; end: LocalDate };

export type FertileEstimate = {
  /** Days with a higher chance of pregnancy (calendar method), both inclusive. */
  fertile: DayRange;
  /** Likely ovulation days, always inside `fertile`. */
  ovulation: DayRange;
  cyclesUsed: number;
  /** Fewer than FERTILE_CYCLES cycles behind it: say "rough estimate". */
  rough: boolean;
};

/**
 * The estimate for the current cycle, or null when there's no honest basis: still learning,
 * or late (this cycle no longer matches her history).
 */
export function estimateFertileDays(
  history: CycleHistory,
  tags: readonly CycleTag[],
  prediction: Prediction,
): FertileEstimate | null {
  const open = history.open;
  if (open === null || prediction.state !== 'window' || prediction.daysLate > 0) return null;

  const lengths = countedCycles(history.closed, tags)
    .slice(0, FERTILE_CYCLES)
    .map((cycle) => cycle.length);
  if (lengths.length < MIN_CYCLES_FOR_PREDICTION) return null;

  const shortest = Math.min(...lengths);
  const longest = Math.max(...lengths);
  // Cycle day 1 is the period start; very short cycles clamp to day 1.
  const onCycleDay = (day: number) => addDays(open.start, Math.max(day, 1) - 1);

  return {
    fertile: {
      start: onCycleDay(shortest - FERTILE_FROM_SHORTEST),
      end: onCycleDay(longest - FERTILE_FROM_LONGEST),
    },
    ovulation: {
      start: onCycleDay(shortest - OVULATION_FROM_SHORTEST),
      end: onCycleDay(longest - OVULATION_FROM_LONGEST),
    },
    cyclesUsed: lengths.length,
    rough: lengths.length < FERTILE_CYCLES,
  };
}

/** Whether `date` falls inside `range` (both ends inclusive). LocalDate strings sort by date. */
export function inRange(date: LocalDate, range: DayRange | null): boolean {
  return range !== null && date >= range.start && date <= range.end;
}
