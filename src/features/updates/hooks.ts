import { useEffect } from 'react';
import { AppState } from 'react-native';

import { localHour } from '@/lib/date';

import {
  checkForAppUpdate,
  getUpdateStatus,
  lastUpdateCheck,
  updatesAvailable,
} from './app-update';
import { shouldAutoCheck } from './logic';

/**
 * Mounted once in the root layout. When the app opens or comes back to the front between 8 PM and
 * 12 AM, quietly checks for an app update (at most every 30 minutes). Does nothing in dev builds.
 */
export function useAutoUpdateCheck(): void {
  useEffect(() => {
    if (!updatesAvailable()) return;
    const maybeCheck = () => {
      const allowed = shouldAutoCheck({
        hour: localHour(),
        nowMs: Date.now(),
        lastCheckMs: lastUpdateCheck(),
        status: getUpdateStatus(),
      });
      if (allowed) void checkForAppUpdate();
    };
    maybeCheck();
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') maybeCheck();
    });
    return () => sub.remove();
  }, []);
}
