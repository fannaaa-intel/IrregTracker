/**
 * When the app may look for an app update, and what to say about it (pure, no React, no clock).
 * CLAUDE.md §1.1 exception: checking for and downloading app code is the only network use.
 *   - automatically only 8:00 PM – 11:59 PM on the phone's clock, while the app is open
 *   - at most once per CHECK_EVERY_MS
 *   - any time from Settings → Check for updates
 */

/** Hours on the phone's own clock; `toHour` is exclusive (24 = midnight). */
export const UPDATE_WINDOW = { fromHour: 20, toHour: 24 } as const;
export const CHECK_EVERY_MS = 30 * 60 * 1000;

export type UpdateStatus =
  'idle' | 'unavailable' | 'checking' | 'downloading' | 'ready' | 'latest' | 'error';

/** `hour` is 0–23 on the phone's clock. */
export function inUpdateWindow(hour: number): boolean {
  return hour >= UPDATE_WINDOW.fromHour && hour < UPDATE_WINDOW.toHour;
}

type AutoCheckInput = {
  hour: number;
  nowMs: number;
  lastCheckMs: number | null;
  status: UpdateStatus;
};

/** An automatic check is allowed: inside the window, not busy or done, not checked recently. */
export function shouldAutoCheck({ hour, nowMs, lastCheckMs, status }: AutoCheckInput): boolean {
  if (status === 'checking' || status === 'downloading' || status === 'ready') return false;
  if (status === 'unavailable') return false;
  if (!inUpdateWindow(hour)) return false;
  return lastCheckMs === null || nowMs - lastCheckMs >= CHECK_EVERY_MS;
}

/** Subtitle of the Settings row. `installed` = false in dev builds, where updates are off. */
export function updateStatusText(
  status: UpdateStatus,
  version: string,
  installed: boolean,
): string {
  if (!installed || status === 'unavailable')
    return `Version ${version}. Updates work in the installed app`;
  switch (status) {
    case 'checking':
      return 'Checking…';
    case 'downloading':
      return 'Downloading the new version…';
    case 'ready':
      return 'New version ready. Tap to restart';
    case 'latest':
      return `Version ${version}. You have the latest version`;
    case 'error':
      return `Version ${version}. Couldn't check. Try again when you're online`;
    case 'idle':
      return `Version ${version}`;
  }
}
