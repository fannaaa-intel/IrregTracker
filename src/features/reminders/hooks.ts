import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { useDb } from '../../db/DatabaseProvider';
import { notifyDbChange, useLiveQuery } from '../../db/live-query';
import { settingRepo } from '../../db/repositories/setting-repo';
import type { Db } from '../../db/types';
import { normalizeKindNotes, type KindNoteSettings, type KindNoteTime } from './logic';
import { notificationsAllowed, requestNotifications, syncKindNotes } from './scheduler';

async function syncFromDb(db: Db): Promise<void> {
  await syncKindNotes(normalizeKindNotes(await settingRepo.getKindNotes(db)));
}

/** Settings → Kind notes: current settings, permission state, and actions that reschedule. */
export function useKindNotes() {
  const db = useDb();
  const stored = useLiveQuery((d) => settingRepo.getKindNotes(d));
  const [allowed, setAllowed] = useState<boolean | undefined>(undefined);
  const settings = stored === undefined ? undefined : normalizeKindNotes(stored);

  useEffect(() => {
    void notificationsAllowed().then(setAllowed);
  }, []);

  const save = async (next: KindNoteSettings) => {
    await settingRepo.setKindNotes(db, next);
    notifyDbChange();
    await syncKindNotes(next);
  };

  return {
    settings,
    /** On, but the phone blocks notifications: show how to allow them. */
    blocked: settings?.enabled === true && allowed === false,
    setEnabled: async (enabled: boolean) => {
      if (settings === undefined) return;
      if (enabled) setAllowed(await requestNotifications());
      await save({ ...settings, enabled });
    },
    setTime: async (time: KindNoteTime) => {
      if (settings !== undefined) await save({ ...settings, time });
    },
  };
}

/** End of the welcome cards: the one-time system prompt, then the first notes are scheduled. */
export function useStartKindNotes(): () => Promise<void> {
  const db = useDb();
  return async () => {
    try {
      await requestNotifications();
      await syncFromDb(db);
    } catch {
      console.warn('Kind notes could not be started.');
    }
  };
}

/**
 * Mounted once inside the database provider: tops up the next 14 days of kind notes whenever the
 * app opens or returns to the front, so they keep coming as long as she uses the app.
 */
export function useKindNotesSync(): void {
  const db = useDb();
  useEffect(() => {
    const sync = async () => {
      try {
        await syncFromDb(db);
      } catch {
        // Never log settings or note content (CLAUDE.md §1.3). A failed top-up retries next open.
        console.warn('Kind notes could not be scheduled.');
      }
    };
    void sync();
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') void sync();
    });
    return () => sub.remove();
  }, [db]);
}
