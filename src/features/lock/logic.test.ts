import { LOCK_GRACE_MS, shouldRelock } from './logic';

describe('shouldRelock', () => {
  const t = 1_000_000;

  it('never locks when the app lock is off', () => {
    expect(shouldRelock(false, t, t + LOCK_GRACE_MS * 10)).toBe(false);
  });

  it('locks after the grace period, not before (boundary)', () => {
    expect(shouldRelock(true, t, t + LOCK_GRACE_MS - 1)).toBe(false);
    expect(shouldRelock(true, t, t + LOCK_GRACE_MS)).toBe(true);
  });

  it('does nothing if the app was never in the background', () => {
    expect(shouldRelock(true, null, t)).toBe(false);
  });
});
