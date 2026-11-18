import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { useDb } from '../../db/DatabaseProvider';
import { notifyDbChange, useLiveQuery } from '../../db/live-query';
import { settingRepo } from '../../db/repositories/setting-repo';
import { normalizeKindNotes, type KindNoteSettings } from './logic';
import { requestNotifications, syncKindNotes } from './scheduler';

/** Settings → Kind notes: current settings, permission state, and actions that reschedule. */
export function useKindNotes() {
  const db = useDb();
  const stored = useLiveQuery((d) => settingRepo.getKindNotes(d));
  const [denied, setDenied] = useState(false);
  const settings = stored === undefined ? undefined : normalizeKindNotes(stored);

  const save = async (next: KindNoteSettings) => {
    await settingRepo.setKindNotes(db, next);
    notifyDbChange();
    await syncKindNotes(next);
  };

  return {
    settings,
    denied,
    setEnabled: async (enabled: boolean) => {
      if (settings === undefined) return;
      if (enabled && !(await requestNotifications())) {
        setDenied(true);
        return;
      }
      setDenied(false);
      await save({ ...settings, enabled });
    },
    setHour: async (hour: number) => {
      if (settings !== undefined) await save({ ...settings, hour });
    },
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
        await syncKindNotes(normalizeKindNotes(await settingRepo.getKindNotes(db)));
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
