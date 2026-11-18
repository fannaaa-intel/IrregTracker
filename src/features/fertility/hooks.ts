import { useDb } from '../../db/DatabaseProvider';
import { notifyDbChange, useLiveQuery } from '../../db/live-query';
import { ovulationTestRepo } from '../../db/repositories/ovulation-test-repo';
import type { LocalDate } from '../../lib/date';
import type { TestResult } from './tests';

/** The ovulation test logged on `date` (null for none, undefined while loading), and actions. */
export function useDayOvulationTest(date: LocalDate) {
  const db = useDb();
  const tests = useLiveQuery((d) => ovulationTestRepo.listAll(d));
  const result =
    tests === undefined ? undefined : (tests.find((t) => t.date === date)?.result ?? null);

  return {
    result,
    set: async (next: TestResult) => {
      await ovulationTestRepo.set(db, date, next);
      notifyDbChange();
    },
    clear: async () => {
      await ovulationTestRepo.delete(db, date);
      notifyDbChange();
    },
  };
}
