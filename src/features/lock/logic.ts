// When the app lock asks again (pure). Away longer than the grace → locked on return.
// The grace also covers the phone's own PIN screen, which briefly sends the app to the background.
export const LOCK_GRACE_MS = 30_000;

export function shouldRelock(
  enabled: boolean,
  backgroundedAtMs: number | null,
  nowMs: number,
): boolean {
  if (!enabled || backgroundedAtMs === null) return false;
  return nowMs - backgroundedAtMs >= LOCK_GRACE_MS;
}
