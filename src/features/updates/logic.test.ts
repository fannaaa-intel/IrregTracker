import { CHECK_EVERY_MS, inUpdateWindow, shouldAutoCheck, updateStatusText } from './logic';

const NOW = 1_000_000_000_000;

describe('inUpdateWindow (8 PM – 12 AM on the phone clock)', () => {
  it.each([
    [19, false],
    [20, true],
    [23, true],
    [0, false],
    [9, false],
  ])('hour %i → %s', (hour, expected) => {
    expect(inUpdateWindow(hour)).toBe(expected);
  });
});

describe('shouldAutoCheck', () => {
  const base = { hour: 21, nowMs: NOW, lastCheckMs: null, status: 'idle' as const };

  it('checks inside the window when never checked', () => {
    expect(shouldAutoCheck(base)).toBe(true);
  });

  it('never checks outside the window', () => {
    expect(shouldAutoCheck({ ...base, hour: 19 })).toBe(false);
    expect(shouldAutoCheck({ ...base, hour: 0 })).toBe(false);
  });

  it('waits 30 minutes between checks (boundary)', () => {
    expect(shouldAutoCheck({ ...base, lastCheckMs: NOW - CHECK_EVERY_MS + 1 })).toBe(false);
    expect(shouldAutoCheck({ ...base, lastCheckMs: NOW - CHECK_EVERY_MS })).toBe(true);
  });

  it.each(['checking', 'downloading', 'ready', 'unavailable'] as const)(
    'skips while %s',
    (status) => {
      expect(shouldAutoCheck({ ...base, status })).toBe(false);
    },
  );

  it.each(['latest', 'error'] as const)('checks again after %s once the wait is over', (status) => {
    expect(shouldAutoCheck({ ...base, status, lastCheckMs: NOW - CHECK_EVERY_MS })).toBe(true);
  });
});

describe('updateStatusText', () => {
  it('explains that dev builds have no updates', () => {
    expect(updateStatusText('idle', '1.0.0', false)).toBe(
      'Version 1.0.0. Updates work in the installed app',
    );
  });

  it('describes each state calmly', () => {
    expect(updateStatusText('idle', '1.0.0', true)).toBe('Version 1.0.0');
    expect(updateStatusText('ready', '1.0.0', true)).toBe('New version ready. Tap to restart');
    expect(updateStatusText('latest', '1.0.0', true)).toContain('latest version');
    expect(updateStatusText('error', '1.0.0', true)).not.toMatch(/!/);
  });
});
