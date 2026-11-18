import { useDb } from '../../db/DatabaseProvider';
import { notifyDbChange, useLiveQuery } from '../../db/live-query';
import { cycleTagRepo, type StoredCycleTag } from '../../db/repositories/cycle-tag-repo';
import { periodDayRepo, type PeriodDay } from '../../db/repositories/period-day-repo';
import { settingRepo } from '../../db/repositories/setting-repo';
import type { LocalDate } from '../../lib/date';
import { predictNextPeriod, type Prediction } from '../prediction/logic';
import { countedCycles, cycleDay, deriveCycles, type CycleHistory } from './logic';
import { summarizeCycles, type CycleSummary } from './summary';
import type { TagReason } from './tags';

/** Every logged period day, kept up to date after each write. */
export function usePeriodDays(): PeriodDay[] | undefined {
  return useLiveQuery((db) => periodDayRepo.listAll(db));
}

export type CycleOverview = {
  history: CycleHistory;
  tags: StoredCycleTag[];
  prediction: Prediction;
  /** "Day X of cycle", or null with nothing logged. */
  day: number | null;
  summary: CycleSummary | null;
};

/** Everything Home, History and the calendar need, derived fresh from the DB (never stored). */
export function useCycleOverview(today: LocalDate): CycleOverview | undefined {
  const days = usePeriodDays();
  const tags = useLiveQuery((db) => cycleTagRepo.listAll(db));
  const confirmed = useLiveQuery((db) => settingRepo.getConfirmedShortCycles(db));
  if (days === undefined || tags === undefined || confirmed === undefined) return undefined;

  const history = deriveCycles(days, { confirmedShortCycles: confirmed });
  return {
    history,
    tags,
    prediction: predictNextPeriod(history, tags, today),
    day: cycleDay(history.open, today),
    summary: summarizeCycles(countedCycles(history.closed, tags)),
  };
}

export function useCycleActions() {
  const db = useDb();
  const write = async (task: () => Promise<unknown>) => {
    await task();
    notifyDbChange();
  };
  return {
    /** Tags a cycle; a new tag leaves the cycle out of predictions by default (PLAN.md §5). */
    setTag: (cycleStart: LocalDate, reason: TagReason, exclude = true) =>
      write(() => cycleTagRepo.upsert(db, { cycleStart, reason, note: null, exclude })),
    removeTag: (cycleStart: LocalDate) => write(() => cycleTagRepo.delete(db, cycleStart)),
    confirmShortCycle: (cycleStart: LocalDate) =>
      write(() => settingRepo.confirmShortCycle(db, cycleStart)),
  };
}
