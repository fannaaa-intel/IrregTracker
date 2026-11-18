import { cycleTagRepo } from '../../db/repositories/cycle-tag-repo';
import { ovulationTestRepo } from '../../db/repositories/ovulation-test-repo';
import { periodDayRepo } from '../../db/repositories/period-day-repo';
import { settingRepo } from '../../db/repositories/setting-repo';
import type { Db } from '../../db/types';
import type { LocalDate } from '../../lib/date';
import { buildOverview, type CycleOverview } from './overview';

/** The same overview as useCycleOverview, read once (for work outside React, like reminders). */
export async function loadCycleOverview(db: Db, today: LocalDate): Promise<CycleOverview> {
  const [days, tags, confirmed, tests] = await Promise.all([
    periodDayRepo.listAll(db),
    cycleTagRepo.listAll(db),
    settingRepo.getConfirmedShortCycles(db),
    ovulationTestRepo.listAll(db),
  ]);
  return buildOverview({ days, tags, confirmed, tests }, today);
}
