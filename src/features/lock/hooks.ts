import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { useDb } from '../../db/DatabaseProvider';
import { notifyDbChange, useLiveQuery } from '../../db/live-query';
import { settingRepo } from '../../db/repositories/setting-repo';
import { nowMs } from '../../lib/date';
import { authenticate, lockAvailable, protectAppSwitcher } from './device';
import { shouldRelock } from './logic';

export type LockState = 'checking' | 'locked' | 'open';

/** Root gate: locked on launch and after LOCK_GRACE_MS away, when the app lock is on. */
export function useAppLockGate(): { state: LockState; unlock: () => Promise<void> } {
  const enabled = useLiveQuery((db) => settingRepo.isAppLockOn(db));
  // The first value read decides the launch state; turning the lock on later in Settings
  // (already unlocked) must not lock her out on the spot.
  const [atLaunch, setAtLaunch] = useState<boolean | undefined>(undefined);
  if (atLaunch === undefined && enabled !== undefined) setAtLaunch(enabled);
  const [decided, setDecided] = useState<'locked' | 'open' | null>(null);
  const backgroundedAt = useRef<number | null>(null);
  const prompting = useRef(false);

  useEffect(() => {
    if (enabled !== undefined) void protectAppSwitcher(enabled).catch(() => undefined);
  }, [enabled]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'background') backgroundedAt.current = nowMs();
      if (next === 'active') {
        if (shouldRelock(enabled === true, backgroundedAt.current, nowMs())) setDecided('locked');
        backgroundedAt.current = null;
      }
    });
    return () => sub.remove();
  }, [enabled]);

  const unlock = useCallback(async () => {
    if (prompting.current) return;
    prompting.current = true;
    try {
      if (await authenticate('Unlock Cycle Tracker')) setDecided('open');
    } finally {
      prompting.current = false;
    }
  }, []);

  const state: LockState =
    atLaunch === undefined ? 'checking' : (decided ?? (atLaunch ? 'locked' : 'open'));
  return { state, unlock };
}

export type LockChange = 'ok' | 'no-screen-lock' | 'cancelled';

/** Settings → App lock. Turning it on or off needs her fingerprint, face or phone PIN. */
export function useAppLockSetting() {
  const db = useDb();
  const enabled = useLiveQuery((d) => settingRepo.isAppLockOn(d));
  return {
    enabled,
    setEnabled: async (on: boolean): Promise<LockChange> => {
      if (on && !(await lockAvailable())) return 'no-screen-lock';
      const ok = await authenticate(on ? 'Turn on app lock' : 'Turn off app lock');
      if (!ok) return 'cancelled';
      await settingRepo.setAppLock(db, on);
      notifyDbChange();
      return 'ok';
    },
  };
}
