import { regular } from '../../features/__fixtures__/histories';
import { runMigrations } from '../migrations';
import { hasNodeSqlite, openMemoryDb } from '../test-utils/memory-db';
import type { Db } from '../types';
import { backupRepo, type DbSnapshot } from './backup-repo';
import { cycleTagRepo } from './cycle-tag-repo';
import { intimacyRepo } from './intimacy-repo';
import { noteRepo } from './note-repo';
import { ovulationTestRepo } from './ovulation-test-repo';
import { periodDayRepo } from './period-day-repo';
import { settingRepo } from './setting-repo';
import { symptomRepo } from './symptom-repo';

const describeSql = hasNodeSqlite ? describe : describe.skip;

describeSql('backupRepo', () => {
  let db: Db;

  beforeEach(async () => {
    db = openMemoryDb();
    await runMigrations(db);
  });

  afterEach(async () => {
    await db.closeAsync();
  });

  async function seed() {
    await periodDayRepo.upsertMany(db, regular.days, '2026-11-18T00:00:00.000Z');
    await cycleTagRepo.upsert(db, {
      cycleStart: regular.starts[1],
      reason: 'travel',
      note: null,
      exclude: true,
    });
    await settingRepo.setOnboardingDone(db);
    await symptomRepo.setForDate(db, regular.starts[1], ['cramps', 'bloating']);
    await intimacyRepo.set(db, regular.starts[2], 'protected');
    await noteRepo.set(db, regular.starts[3], 'A made-up note.');
    await ovulationTestRepo.set(db, regular.starts[3], 'positive');
    await db.runAsync("INSERT INTO setting (key, value) VALUES ('app_lock', 'true');");
  }

  it('reads every row and skips device-only settings', async () => {
    await seed();
    const snap = await backupRepo.readAll(db, ['app_lock']);
    expect(snap.schemaVersion).toBe(4);
    expect(snap.ovulationTests).toEqual([{ date: regular.starts[3], result: 'positive' }]);
    expect(snap.notes).toEqual([{ date: regular.starts[3], body: 'A made-up note.' }]);
    expect(snap.symptoms).toEqual([
      { date: regular.starts[1], type: 'bloating' },
      { date: regular.starts[1], type: 'cramps' },
    ]);
    expect(snap.intimacy).toEqual([{ date: regular.starts[2], protection: 'protected' }]);
    expect(snap.periodDays).toHaveLength(regular.days.length);
    expect(snap.cycleTags).toEqual([
      { cycleStart: regular.starts[1], reason: 'travel', note: null, exclude: true },
    ]);
    expect(snap.settings.map((s) => s.key)).toEqual(['onboarding_done']);
  });

  it('round-trips: replace with a snapshot gives the same data back', async () => {
    await seed();
    const snap = await backupRepo.readAll(db);
    await backupRepo.replaceAll(db, {
      ...snap,
      periodDays: [],
      cycleTags: [],
      settings: [],
      symptoms: [],
      intimacy: [],
      notes: [],
      ovulationTests: [],
    });
    expect(await periodDayRepo.listAll(db)).toEqual([]);
    expect(await noteRepo.listAll(db)).toEqual([]);
    expect(await symptomRepo.listAll(db)).toEqual([]);
    await backupRepo.replaceAll(db, snap);
    expect(await backupRepo.readAll(db)).toEqual(snap);
  });

  it('keeps device-only settings when restoring', async () => {
    await seed();
    const empty: DbSnapshot = {
      schemaVersion: 1,
      periodDays: [],
      cycleTags: [],
      settings: [],
      symptoms: [],
      intimacy: [],
      notes: [],
      ovulationTests: [],
    };
    await backupRepo.replaceAll(db, empty, ['app_lock']);
    const settings = (await backupRepo.readAll(db)).settings.map((s) => s.key);
    expect(settings).toEqual(['app_lock']);
  });

  it('changes nothing when a row is rejected mid-restore', async () => {
    await seed();
    const before = await backupRepo.readAll(db);
    const bad: DbSnapshot = {
      ...before,
      periodDays: [{ ...before.periodDays[0], flow: 'not-a-flow' }],
    };
    await expect(backupRepo.replaceAll(db, bad)).rejects.toThrow();
    expect(await backupRepo.readAll(db)).toEqual(before);
  });
});
