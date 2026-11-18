import { regular } from '../__fixtures__/histories';
import { passphraseProblem, summarizeBackup, validateBackupData, type BackupData } from './format';

const STAMP = '2026-11-18T00:00:00.000Z';
const sample: BackupData = {
  schemaVersion: 1,
  periodDays: regular.days.map((d) => ({ ...d, createdAt: STAMP, updatedAt: STAMP })),
  cycleTags: [{ cycleStart: regular.starts[1], reason: 'travel', note: null, exclude: true }],
  settings: [
    { key: 'onboarding_done', value: 'true' },
    { key: 'app_lock', value: 'true' },
  ],
};

describe('validateBackupData', () => {
  it('accepts a well-formed backup and drops device-only settings', () => {
    const data = validateBackupData(JSON.parse(JSON.stringify(sample)));
    expect(data?.periodDays).toHaveLength(regular.days.length);
    expect(data?.settings.map((s) => s.key)).toEqual(['onboarding_done']);
  });

  it.each([
    ['a bad date', { periodDays: [{ ...sample.periodDays[0], date: '2026-02-30' }] }],
    ['an unknown flow', { periodDays: [{ ...sample.periodDays[0], flow: 'lots' }] }],
    ['a duplicate day', { periodDays: [sample.periodDays[0], sample.periodDays[0]] }],
    ['an unknown tag reason', { cycleTags: [{ ...sample.cycleTags[0], reason: 'party' }] }],
    ['a missing schema version', { schemaVersion: undefined }],
    ['settings that are not text', { settings: [{ key: 'x', value: 1 }] }],
  ])('rejects %s', (_, patch) => {
    expect(validateBackupData({ ...sample, ...patch })).toBeNull();
  });

  it('rejects things that are not backups at all', () => {
    expect(validateBackupData(null)).toBeNull();
    expect(validateBackupData([])).toBeNull();
  });
});

describe('summarizeBackup', () => {
  it('counts days and tags and finds the date range', () => {
    expect(summarizeBackup(sample)).toEqual({
      days: regular.days.length,
      firstDate: regular.days[0].date,
      lastDate: regular.days[regular.days.length - 1].date,
      tags: 1,
    });
  });

  it('handles an empty backup', () => {
    expect(summarizeBackup({ ...sample, periodDays: [], cycleTags: [], settings: [] })).toEqual({
      days: 0,
      firstDate: null,
      lastDate: null,
      tags: 0,
    });
  });
});

describe('passphraseProblem', () => {
  it('needs at least 8 characters (boundary 7 vs 8) and a matching confirmation', () => {
    expect(passphraseProblem('1234567', '1234567')).toMatch(/at least 8/);
    expect(passphraseProblem('12345678', '12345678')).toBeNull();
    expect(passphraseProblem('12345678', '12345679')).toMatch(/don't match/);
  });
});
