import { useDb } from '../../db/DatabaseProvider';
import { notifyDbChange, useLiveQuery } from '../../db/live-query';
import { intimacyRepo, type IntimacyEntry } from '../../db/repositories/intimacy-repo';
import type { LocalDate } from '../../lib/date';
import type { Protection } from './logic';

/** Every logged day, kept up to date after each write. */
export function useIntimacyEntries(): IntimacyEntry[] | undefined {
  return useLiveQuery((db) => intimacyRepo.listAll(db));
}

/** What's logged on `date`: a protection value, null for nothing, undefined while loading. */
export function useDayIntimacy(date: LocalDate) {
  const db = useDb();
  const entries = useIntimacyEntries();
  const protection =
    entries === undefined ? undefined : (entries.find((e) => e.date === date)?.protection ?? null);

  return {
    protection,
    set: async (next: Protection) => {
      await intimacyRepo.set(db, date, next);
      notifyDbChange();
    },
    clear: async () => {
      await intimacyRepo.delete(db, date);
      notifyDbChange();
    },
  };
}
