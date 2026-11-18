// Everything Home, History, the calendar and reminders need, derived fresh (cycles are never
// stored, CLAUDE.md §4.3). Pure: rows in, plain data out; `today` is passed in.
import type { StoredCycleTag } from '../../db/repositories/cycle-tag-repo';
import type { LocalDate } from '../../lib/date';
import { fertileStatus, type FertileEstimate, type FertileStatus } from '../fertility/logic';
import type { TestResult } from '../fertility/tests';
import { predictNextPeriod, type Prediction } from '../prediction/logic';
import {
  countedCycles,
  cycleDay,
  deriveCycles,
  type CycleHistory,
  type PeriodDayInput,
} from './logic';
import { summarizeCycles, type CycleSummary } from './summary';

export type CycleOverview = {
  history: CycleHistory;
  tags: StoredCycleTag[];
  prediction: Prediction;
  /** "Day X of cycle", or null with nothing logged. */
  day: number | null;
  summary: CycleSummary | null;
  /** Possible fertile and ovulation days for this cycle; null without an honest basis. */
  fertile: FertileEstimate | null;
  /** Why there is (or isn't) a fertile estimate, for the words on Home. */
  fertileStatus: FertileStatus;
};

export type OverviewRows = {
  days: readonly PeriodDayInput[];
  tags: StoredCycleTag[];
  confirmed: readonly LocalDate[];
  /** Ovulation (LH) test results; optional, most people never log any. */
  tests?: readonly { date: LocalDate; result: TestResult }[];
};

export function buildOverview(
  { days, tags, confirmed, tests = [] }: OverviewRows,
  today: LocalDate,
): CycleOverview {
  const history = deriveCycles(days, { confirmedShortCycles: confirmed });
  const prediction = predictNextPeriod(history, tags, today);
  const fertility = fertileStatus(history, tags, prediction, tests);
  return {
    history,
    tags,
    prediction,
    day: cycleDay(history.open, today),
    summary: summarizeCycles(countedCycles(history.closed, tags)),
    fertile: fertility.state === 'shown' ? fertility.estimate : null,
    fertileStatus: fertility,
  };
}
