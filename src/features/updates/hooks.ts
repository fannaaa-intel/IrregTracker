import { useEffect } from 'react';
import { AppState } from 'react-native';

import { localHour, nowMs } from '@/lib/date';

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
        nowMs: nowMs(),
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

/**
 * Recovery: while the app can't open its storage, check for a fixed version right away, outside
 * the 8 PM – 12 AM window. A downloaded update also loads by itself on the next launch.
 */
export function useRecoveryUpdateCheck(active: boolean): void {
  useEffect(() => {
    if (active && updatesAvailable() && getUpdateStatus() === 'idle') void checkForAppUpdate();
  }, [active]);
}
