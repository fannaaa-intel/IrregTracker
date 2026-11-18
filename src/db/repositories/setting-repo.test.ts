import { runMigrations } from '../migrations';
import { hasNodeSqlite, openMemoryDb } from '../test-utils/memory-db';
import type { Db } from '../types';
import { settingRepo } from './setting-repo';

const describeSql = hasNodeSqlite ? describe : describe.skip;

describeSql('settingRepo', () => {
  let db: Db;

  beforeEach(async () => {
    db = openMemoryDb();
    await runMigrations(db);
  });

  afterEach(async () => {
    await db.closeAsync();
  });

  it('remembers dismissed flags once each', async () => {
    expect(await settingRepo.getDismissedFlags(db)).toEqual([]);
    await settingRepo.dismissFlag(db, 'long-cycle:2026-03-01');
    await settingRepo.dismissFlag(db, 'long-cycle:2026-03-01');
    await settingRepo.dismissFlag(db, 'high-variation:2026-02-01');
    expect(await settingRepo.getDismissedFlags(db)).toEqual([
      'high-variation:2026-02-01',
      'long-cycle:2026-03-01',
    ]);
  });

  it('falls back to no dismissed flags when the stored value is not a list', async () => {
    await db.runAsync("INSERT INTO setting (key, value) VALUES ('dismissed_flags', '{\"x\":1}');");
    expect(await settingRepo.getDismissedFlags(db)).toEqual([]);
  });

  it('stores kind-note settings and rejects malformed values', async () => {
    expect(await settingRepo.getKindNotes(db)).toBeNull();
    await settingRepo.setKindNotes(db, { enabled: false, time: 'surprise' });
    expect(await settingRepo.getKindNotes(db)).toEqual({ enabled: false, time: 'surprise' });
    await settingRepo.setKindNotes(db, { enabled: true, time: 18 });
    expect(await settingRepo.getKindNotes(db)).toEqual({ enabled: true, time: 18 });
    await db.runAsync(
      'UPDATE setting SET value = \'{"enabled":true,"time":24}\' WHERE key = \'kind_notes\';',
    );
    expect(await settingRepo.getKindNotes(db)).toBeNull();
  });

  it('stores the app lock switch, off by default', async () => {
    expect(await settingRepo.isAppLockOn(db)).toBe(false);
    await settingRepo.setAppLock(db, true);
    expect(await settingRepo.isAppLockOn(db)).toBe(true);
    await settingRepo.setAppLock(db, false);
    expect(await settingRepo.isAppLockOn(db)).toBe(false);
  });

  it('shows fertile days unless turned off', async () => {
    expect(await settingRepo.isFertileDaysOn(db)).toBe(true);
    await settingRepo.setFertileDays(db, false);
    expect(await settingRepo.isFertileDaysOn(db)).toBe(false);
    await settingRepo.setFertileDays(db, true);
    expect(await settingRepo.isFertileDaysOn(db)).toBe(true);
  });

  it('stores cycle reminder settings and rejects malformed values', async () => {
    expect(await settingRepo.getCycleReminders(db)).toBeNull();
    await settingRepo.setCycleReminders(db, { enabled: true, details: false });
    expect(await settingRepo.getCycleReminders(db)).toEqual({ enabled: true, details: false });
    await db.runAsync(
      `UPDATE setting SET value = '{"enabled":true}' WHERE key = 'cycle_reminders';`,
    );
    expect(await settingRepo.getCycleReminders(db)).toBeNull();
  });

  it('tracks whether onboarding was finished', async () => {
    expect(await settingRepo.isOnboardingDone(db)).toBe(false);
    await settingRepo.setOnboardingDone(db);
    expect(await settingRepo.isOnboardingDone(db)).toBe(true);
  });
});
