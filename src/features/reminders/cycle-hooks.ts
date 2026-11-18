import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { useDb } from '../../db/DatabaseProvider';
import { notifyDbChange, subscribeDbChange, useLiveQuery } from '../../db/live-query';
import { settingRepo } from '../../db/repositories/setting-repo';
import { normalizeCycleReminders, type CycleReminderSettings } from './cycle-logic';
import { syncCycleReminders } from './cycle-scheduler';
import { notificationsAllowed, requestNotifications } from './scheduler';

/** Wait this long after the last change before re-planning (several taps in a row = one sync). */
const SYNC_DELAY_MS = 1500;

/**
 * Mounted once inside the database provider: re-plans cycle reminders when the app opens, returns
 * to the front, or anything is logged, so they always follow her latest data.
 */
export function useCycleRemindersSync(): void {
  const db = useDb();
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const sync = () => {
      syncCycleReminders(db).catch(() => {
        // Never log settings or dates (CLAUDE.md §1.3). A failed sync retries on the next change.
        console.warn('Cycle reminders could not be scheduled.');
      });
    };
    const later = () => {
      if (timer !== null) clearTimeout(timer);
      timer = setTimeout(sync, SYNC_DELAY_MS);
    };
    sync();
    const unsubscribe = subscribeDbChange(later);
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') sync();
    });
    return () => {
      if (timer !== null) clearTimeout(timer);
      unsubscribe();
      sub.remove();
    };
  }, [db]);
}

/** Settings → Reminders and Fertile days. */
export function useCycleReminderSettings() {
  const db = useDb();
  const stored = useLiveQuery((d) => settingRepo.getCycleReminders(d));
  const fertileOn = useLiveQuery((d) => settingRepo.isFertileDaysOn(d));
  const [allowed, setAllowed] = useState<boolean | undefined>(undefined);
  const settings = stored === undefined ? undefined : normalizeCycleReminders(stored);

  useEffect(() => {
    void notificationsAllowed().then(setAllowed);
  }, []);

  const save = async (next: CycleReminderSettings) => {
    await settingRepo.setCycleReminders(db, next);
    notifyDbChange(); // the sync hook re-plans
  };

  return {
    settings,
    fertileOn,
    blocked: settings?.enabled === true && allowed === false,
    setEnabled: async (enabled: boolean) => {
      if (settings === undefined) return;
      if (enabled) setAllowed(await requestNotifications());
      await save({ ...settings, enabled });
    },
    setDetails: async (details: boolean) => {
      if (settings !== undefined) await save({ ...settings, details });
    },
    setFertileOn: async (on: boolean) => {
      await settingRepo.setFertileDays(db, on);
      notifyDbChange();
    },
  };
}
