import { runMigrations } from '../migrations';
import { hasNodeSqlite, openMemoryDb } from '../test-utils/memory-db';
import type { Db } from '../types';
import { intimacyRepo } from './intimacy-repo';
import { noteRepo } from './note-repo';
import { ovulationTestRepo } from './ovulation-test-repo';
import { symptomRepo } from './symptom-repo';

// Made-up dates that only exercise the SQL.
const describeSql = hasNodeSqlite ? describe : describe.skip;

describeSql('symptomRepo', () => {
  let db: Db;

  beforeEach(async () => {
    db = openMemoryDb();
    await runMigrations(db);
  });

  afterEach(async () => {
    await db.closeAsync();
  });

  it('sets, replaces and clears the symptoms of one day', async () => {
    await symptomRepo.setForDate(db, '2026-03-04', ['cramps', 'bloating']);
    await symptomRepo.setForDate(db, '2026-03-05', ['acne']);
    expect(await symptomRepo.listAll(db)).toEqual([
      { date: '2026-03-04', type: 'bloating' },
      { date: '2026-03-04', type: 'cramps' },
      { date: '2026-03-05', type: 'acne' },
    ]);

    await symptomRepo.setForDate(db, '2026-03-04', ['headache']);
    await symptomRepo.setForDate(db, '2026-03-05', []);
    expect(await symptomRepo.listAll(db)).toEqual([{ date: '2026-03-04', type: 'headache' }]);
  });

  it('skips symptom types this version does not know', async () => {
    await db.runAsync("INSERT INTO symptom (date, type) VALUES ('2026-03-04', 'from-the-future');");
    expect(await symptomRepo.listAll(db)).toEqual([]);
  });
});

describeSql('intimacyRepo', () => {
  let db: Db;

  beforeEach(async () => {
    db = openMemoryDb();
    await runMigrations(db);
  });

  afterEach(async () => {
    await db.closeAsync();
  });

  it('logs, changes and removes a day', async () => {
    await intimacyRepo.set(db, '2026-03-04', 'protected');
    await intimacyRepo.set(db, '2026-03-04', 'unprotected');
    expect(await intimacyRepo.listAll(db)).toEqual([
      { date: '2026-03-04', protection: 'unprotected' },
    ]);
    await intimacyRepo.delete(db, '2026-03-04');
    expect(await intimacyRepo.listAll(db)).toEqual([]);
  });

  it('rejects an unknown protection value', async () => {
    await expect(
      db.runAsync("INSERT INTO intimacy (date, protection) VALUES ('2026-03-04', 'maybe');"),
    ).rejects.toThrow();
  });
});

describeSql('noteRepo', () => {
  let db: Db;

  beforeEach(async () => {
    db = openMemoryDb();
    await runMigrations(db);
  });

  afterEach(async () => {
    await db.closeAsync();
  });

  it('saves, replaces and removes the note of a day', async () => {
    await noteRepo.set(db, '2026-03-04', 'First made-up note.');
    await noteRepo.set(db, '2026-03-04', 'Changed made-up note.');
    await noteRepo.set(db, '2026-03-02', 'Earlier made-up note.');
    expect(await noteRepo.listAll(db)).toEqual([
      { date: '2026-03-02', body: 'Earlier made-up note.' },
      { date: '2026-03-04', body: 'Changed made-up note.' },
    ]);
    await noteRepo.delete(db, '2026-03-04');
    expect(await noteRepo.listAll(db)).toHaveLength(1);
  });
});

describeSql('ovulationTestRepo', () => {
  let db: Db;

  beforeEach(async () => {
    db = openMemoryDb();
    await runMigrations(db);
  });

  afterEach(async () => {
    await db.closeAsync();
  });

  it('logs, changes and removes a test, and rejects unknown results', async () => {
    await ovulationTestRepo.set(db, '2026-03-14', 'negative');
    await ovulationTestRepo.set(db, '2026-03-14', 'positive');
    expect(await ovulationTestRepo.listAll(db)).toEqual([
      { date: '2026-03-14', result: 'positive' },
    ]);
    await ovulationTestRepo.delete(db, '2026-03-14');
    expect(await ovulationTestRepo.listAll(db)).toEqual([]);
    await expect(
      db.runAsync("INSERT INTO ovulation_test (date, result) VALUES ('2026-03-15', 'maybe');"),
    ).rejects.toThrow();
  });
});
