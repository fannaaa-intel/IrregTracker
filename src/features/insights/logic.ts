// Symptom patterns around her period ("Cramps: usually about 1 day before your period starts").
// Pure. Describes her own logs only: no diagnosis, no prediction of a date (CLAUDE.md §2).
import { diffDays, type LocalDate } from '../../lib/date';
import { median } from '../../lib/stats';
import type { CycleHistory } from '../cycles/logic';
import { SYMPTOMS, symptomLabel, type Symptom } from '../symptoms/logic';

/** A pattern needs the symptom logged around at least this many periods. Product decision. */
export const PATTERN_MIN_PERIODS = 3;
/** Symptoms this many days before or after a period start count as "around" it. */
export const PATTERN_WINDOW_DAYS = 7;

export type SymptomPattern = {
  symptom: Symptom;
  /** Typical first day relative to the period start: −1 = the day before, 0 = day 1. */
  offset: number;
  /** Around how many periods it was logged. */
  periods: number;
};

/** Every period start, oldest first (closed cycles plus the current one). */
function periodStarts(history: CycleHistory): LocalDate[] {
  const starts = history.closed.map((c) => c.start).reverse();
  if (history.open !== null) starts.push(history.open.start);
  return starts;
}

/** Patterns seen around enough periods, most consistent first. */
export function symptomPatterns(
  history: CycleHistory,
  entries: readonly { date: LocalDate; type: Symptom }[],
): SymptomPattern[] {
  const starts = periodStarts(history);
  const patterns: SymptomPattern[] = [];

  for (const symptom of SYMPTOMS) {
    const dates = entries.filter((e) => e.type === symptom).map((e) => e.date);
    const firstOffsets: number[] = [];
    for (const start of starts) {
      const near = dates
        .map((date) => diffDays(date, start))
        .filter((offset) => Math.abs(offset) <= PATTERN_WINDOW_DAYS);
      if (near.length > 0) firstOffsets.push(Math.min(...near));
    }
    if (firstOffsets.length >= PATTERN_MIN_PERIODS) {
      patterns.push({
        symptom,
        offset: Math.round(median(firstOffsets)),
        periods: firstOffsets.length,
      });
    }
  }
  return patterns.sort((a, b) => b.periods - a.periods || a.offset - b.offset);
}

const days = (n: number) => `${n} day${n === 1 ? '' : 's'}`;

/** "Cramps: usually about 1 day before your period starts". */
export function patternText({ symptom, offset }: SymptomPattern): string {
  const when =
    offset < 0
      ? `about ${days(-offset)} before your period starts`
      : offset === 0
        ? 'on the first day of your period'
        : `around day ${offset + 1} of your period`;
  return `${symptomLabel[symptom]}: usually ${when}`;
}
