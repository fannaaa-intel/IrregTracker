import { cycleTagRepo } from '../../db/repositories/cycle-tag-repo';
import { periodDayRepo } from '../../db/repositories/period-day-repo';
import { settingRepo } from '../../db/repositories/setting-repo';
import type { Db } from '../../db/types';
import type { LocalDate } from '../../lib/date';
import { buildOverview, type CycleOverview } from './overview';

/** The same overview as useCycleOverview, read once (for work outside React, like reminders). */
export async function loadCycleOverview(db: Db, today: LocalDate): Promise<CycleOverview> {
  const [days, tags, confirmed] = await Promise.all([
    periodDayRepo.listAll(db),
    cycleTagRepo.listAll(db),
    settingRepo.getConfirmedShortCycles(db),
  ]);
  return buildOverview({ days, tags, confirmed }, today);
}
