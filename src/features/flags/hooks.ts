import { useDb } from '../../db/DatabaseProvider';
import { notifyDbChange, useLiveQuery } from '../../db/live-query';
import { settingRepo } from '../../db/repositories/setting-repo';
import type { LocalDate } from '../../lib/date';
import type { CycleOverview } from '../cycles/hooks';
import { detectFlags, pickFlag, type HealthFlag } from './logic';

/** The single flag card for Home (PLAN.md §6), or null. Dismissing hides that occurrence for good. */
export function useFlagCard(
  overview: CycleOverview | undefined,
  today: LocalDate,
): { flag: HealthFlag | null; dismiss: (id: string) => Promise<void> } {
  const db = useDb();
  const dismissed = useLiveQuery((d) => settingRepo.getDismissedFlags(d));

  const dismiss = async (id: string) => {
    await settingRepo.dismissFlag(db, id);
    notifyDbChange();
  };

  if (overview === undefined || dismissed === undefined) return { flag: null, dismiss };
  const flags = detectFlags(overview.history, overview.tags, today);
  return { flag: pickFlag(flags, dismissed), dismiss };
}
