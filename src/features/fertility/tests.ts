// Ovulation (LH) test results (Nov 19, 2026). Pure. A positive test is the most reliable thing
// the app can use for irregular cycles (docs/HEALTH_RULES.md → "Ovulation (LH) tests").
import { addDays, diffDays, type LocalDate } from '../../lib/date';
import type { OpenCycle } from '../cycles/logic';
import { FERTILE_DAYS_BEFORE_OVULATION, LH_OVULATION_WITHIN } from '../flags/thresholds';

export type TestResult = 'positive' | 'negative';
export const TEST_RESULTS: readonly TestResult[] = ['positive', 'negative'];

export const testResultLabel: Record<TestResult, string> = {
  positive: 'Positive',
  negative: 'Negative',
};

export function isTestResult(value: string): value is TestResult {
  return (TEST_RESULTS as readonly string[]).includes(value);
}

/** The first positive test in this cycle after the period ended, or null. */
export function positiveTestThisCycle(
  open: OpenCycle | null,
  tests: readonly { date: LocalDate; result: TestResult }[],
): LocalDate | null {
  if (open === null) return null;
  const positives = tests
    .filter((t) => t.result === 'positive' && diffDays(t.date, open.period.end) > 0)
    .map((t) => t.date)
    .sort();
  return positives[0] ?? null;
}

/** Ovulation and fertile days around a positive test on `positive`. */
export function rangesFromTest(positive: LocalDate, cycleStart: LocalDate) {
  const ovulationEnd = addDays(positive, LH_OVULATION_WITHIN);
  const fertileStart = addDays(positive, -FERTILE_DAYS_BEFORE_OVULATION);
  return {
    ovulation: { start: positive, end: ovulationEnd },
    // Never before day 1 of this cycle.
    fertile: { start: fertileStart < cycleStart ? cycleStart : fertileStart, end: ovulationEnd },
  };
}
