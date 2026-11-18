/**
 * App updates through EAS Update (expo-updates). The only network use in the app (CLAUDE.md §1.1
 * exception): ask Expo's update server whether newer app code exists, and download it. No health
 * data is ever sent. The new code runs after a restart; the encrypted database is untouched.
 * In dev builds updates are off, so the status stays 'unavailable'.
 */
import * as Updates from 'expo-updates';
import { useSyncExternalStore } from 'react';

import type { UpdateStatus } from './logic';

type State = { status: UpdateStatus; bannerDismissed: boolean };

let state: State = { status: 'idle', bannerDismissed: false };
let lastCheckMs: number | null = null;
const listeners = new Set<() => void>();

function setState(patch: Partial<State>): void {
  state = { ...state, ...patch };
  for (const listener of [...listeners]) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useUpdateState(): State {
  return useSyncExternalStore(subscribe, () => state);
}

export function getUpdateStatus(): UpdateStatus {
  return state.status;
}

export function lastUpdateCheck(): number | null {
  return lastCheckMs;
}

/** False in dev builds and Jest, where expo-updates is disabled. */
export function updatesAvailable(): boolean {
  return Updates.isEnabled && !__DEV__;
}

export function dismissUpdateBanner(): void {
  setState({ bannerDismissed: true });
}

export function restartIntoUpdate(): void {
  // If the reload fails, the new version still loads the next time the app is opened.
  Updates.reloadAsync().catch(() => setState({ status: 'ready' }));
}

/** Check, and download if there is something new. Errors only change the status, never alert. */
export async function checkForAppUpdate(): Promise<void> {
  if (!updatesAvailable()) {
    setState({ status: 'unavailable' });
    return;
  }
  const { status } = state;
  if (status === 'checking' || status === 'downloading') return;
  if (status === 'ready') {
    restartIntoUpdate();
    return;
  }
  lastCheckMs = Date.now();
  setState({ status: 'checking' });
  try {
    const found = await Updates.checkForUpdateAsync();
    if (!found.isAvailable) {
      setState({ status: 'latest' });
      return;
    }
    setState({ status: 'downloading' });
    await Updates.fetchUpdateAsync();
    setState({ status: 'ready', bannerDismissed: false });
  } catch {
    // No details logged: an offline phone is normal, not a fault (CLAUDE.md §1.3).
    setState({ status: 'error' });
  }
}
