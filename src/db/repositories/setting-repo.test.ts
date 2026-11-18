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
    await settingRepo.setKindNotes(db, { enabled: true, hour: 21 });
    expect(await settingRepo.getKindNotes(db)).toEqual({ enabled: true, hour: 21 });
    await db.runAsync(
      'UPDATE setting SET value = \'{"enabled":true,"hour":24}\' WHERE key = \'kind_notes\';',
    );
    expect(await settingRepo.getKindNotes(db)).toBeNull();
  });

  it('tracks whether onboarding was finished', async () => {
    expect(await settingRepo.isOnboardingDone(db)).toBe(false);
    await settingRepo.setOnboardingDone(db);
    expect(await settingRepo.isOnboardingDone(db)).toBe(true);
  });
});
