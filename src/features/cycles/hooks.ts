import { useDb } from '../../db/DatabaseProvider';
import { notifyDbChange, useLiveQuery } from '../../db/live-query';
import { cycleTagRepo } from '../../db/repositories/cycle-tag-repo';
import { ovulationTestRepo } from '../../db/repositories/ovulation-test-repo';
import { periodDayRepo, type PeriodDay } from '../../db/repositories/period-day-repo';
import { settingRepo } from '../../db/repositories/setting-repo';
import type { LocalDate } from '../../lib/date';
import { buildOverview, type CycleOverview } from './overview';
import type { TagReason } from './tags';

export type { CycleOverview } from './overview';

/** Every logged period day, kept up to date after each write. */
export function usePeriodDays(): PeriodDay[] | undefined {
  return useLiveQuery((db) => periodDayRepo.listAll(db));
}

/** Everything Home, History and the calendar need, derived fresh from the DB (never stored). */
export function useCycleOverview(today: LocalDate): CycleOverview | undefined {
  const days = usePeriodDays();
  const tags = useLiveQuery((db) => cycleTagRepo.listAll(db));
  const confirmed = useLiveQuery((db) => settingRepo.getConfirmedShortCycles(db));
  const tests = useLiveQuery((db) => ovulationTestRepo.listAll(db));
  if (days === undefined || tags === undefined || confirmed === undefined || tests === undefined) {
    return undefined;
  }
  return buildOverview({ days, tags, confirmed, tests }, today);
}

/** Whether to show possible fertile days (Settings → Fertile days). Undefined while loading. */
export function useFertileDaysOn(): boolean | undefined {
  return useLiveQuery((db) => settingRepo.isFertileDaysOn(db));
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
