import { runMigrations } from '../migrations';
import { hasNodeSqlite, openMemoryDb } from '../test-utils/memory-db';
import type { Db } from '../types';
import { cycleTagRepo, type TagReason } from './cycle-tag-repo';
import { settingRepo } from './setting-repo';

const describeSql = hasNodeSqlite ? describe : describe.skip;

describeSql('cycleTagRepo', () => {
  let db: Db;

  beforeEach(async () => {
    db = openMemoryDb();
    await runMigrations(db);
  });

  afterEach(async () => {
    await db.closeAsync();
  });

  it('tags a cycle and changes the tag in place', async () => {
    await cycleTagRepo.upsert(db, {
      cycleStart: '2026-03-01',
      reason: 'illness',
      note: null,
      exclude: true,
    });
    await cycleTagRepo.upsert(db, {
      cycleStart: '2026-03-01',
      reason: 'travel',
      note: 'flight',
      exclude: false,
    });

    expect(await cycleTagRepo.listAll(db)).toEqual([
      { cycleStart: '2026-03-01', reason: 'travel', note: 'flight', exclude: false },
    ]);
  });

  it('removes a tag and reports whether there was one', async () => {
    await cycleTagRepo.upsert(db, {
      cycleStart: '2026-03-01',
      reason: 'stress',
      note: null,
      exclude: true,
    });
    await expect(cycleTagRepo.delete(db, '2026-03-01')).resolves.toBe(true);
    await expect(cycleTagRepo.delete(db, '2026-03-01')).resolves.toBe(false);
    expect(await cycleTagRepo.listAll(db)).toEqual([]);
  });

  it('rejects a reason outside the allowed values', async () => {
    const invalid = 'holiday' as TagReason;
    await expect(
      cycleTagRepo.upsert(db, {
        cycleStart: '2026-03-01',
        reason: invalid,
        note: null,
        exclude: true,
      }),
    ).rejects.toThrow();
  });
});

describeSql('settingRepo', () => {
  let db: Db;

  beforeEach(async () => {
    db = openMemoryDb();
    await runMigrations(db);
  });

  afterEach(async () => {
    await db.closeAsync();
  });

  it('starts with no confirmed short cycles', async () => {
    expect(await settingRepo.getConfirmedShortCycles(db)).toEqual([]);
  });

  it('remembers confirmed short cycles once each, sorted', async () => {
    await settingRepo.confirmShortCycle(db, '2026-05-10');
    await settingRepo.confirmShortCycle(db, '2026-02-01');
    await settingRepo.confirmShortCycle(db, '2026-05-10');
    expect(await settingRepo.getConfirmedShortCycles(db)).toEqual(['2026-02-01', '2026-05-10']);
  });

  it('ignores a corrupted stored value instead of crashing', async () => {
    await db.runAsync(
      "INSERT INTO setting (key, value) VALUES ('confirmed_short_cycles', '{oops');",
    );
    expect(await settingRepo.getConfirmedShortCycles(db)).toEqual([]);

    await db.runAsync(
      `UPDATE setting SET value = '["2026-02-01", 7, "not-a-date"]' WHERE key = 'confirmed_short_cycles';`,
    );
    expect(await settingRepo.getConfirmedShortCycles(db)).toEqual(['2026-02-01']);
  });
});
