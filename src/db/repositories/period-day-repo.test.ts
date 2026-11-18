import type { Flow } from '../../theme';
import { runMigrations } from '../migrations';
import { hasNodeSqlite, openMemoryDb } from '../test-utils/memory-db';
import type { Db } from '../types';
import { periodDayRepo } from './period-day-repo';

// Made-up dates that only exercise the SQL; cycle histories live in features/__fixtures__ (M2).
const T1 = '2026-01-01T08:00:00.000Z';
const T2 = '2026-01-02T08:00:00.000Z';

const describeSql = hasNodeSqlite ? describe : describe.skip;

describeSql('periodDayRepo', () => {
  let db: Db;

  beforeEach(async () => {
    db = openMemoryDb();
    await runMigrations(db);
  });

  afterEach(async () => {
    await db.closeAsync();
  });

  it('inserts a new period day', async () => {
    await periodDayRepo.upsert(db, { date: '2026-03-04', flow: 'medium' }, T1);

    expect(await periodDayRepo.listBetween(db, '2026-03-01', '2026-03-31')).toEqual([
      { date: '2026-03-04', flow: 'medium', createdAt: T1, updatedAt: T1 },
    ]);
  });

  it('updates the flow of an existing day and keeps created_at', async () => {
    await periodDayRepo.upsert(db, { date: '2026-03-04', flow: 'medium' }, T1);
    await periodDayRepo.upsert(db, { date: '2026-03-04', flow: 'heavy' }, T2);

    expect(await periodDayRepo.listBetween(db, '2026-03-04', '2026-03-04')).toEqual([
      { date: '2026-03-04', flow: 'heavy', createdAt: T1, updatedAt: T2 },
    ]);
  });

  it('rejects a flow outside the allowed values', async () => {
    const invalid = 'unknown' as Flow;
    await expect(
      periodDayRepo.upsert(db, { date: '2026-03-04', flow: invalid }, T1),
    ).rejects.toThrow();
  });

  it('deletes a day and reports whether anything was removed', async () => {
    await periodDayRepo.upsert(db, { date: '2026-03-04', flow: 'light' }, T1);

    await expect(periodDayRepo.delete(db, '2026-03-04')).resolves.toBe(true);
    await expect(periodDayRepo.delete(db, '2026-03-04')).resolves.toBe(false);
    expect(await periodDayRepo.listBetween(db, '2026-03-01', '2026-03-31')).toEqual([]);
  });

  it('saves several days at once and lists every day oldest first', async () => {
    await periodDayRepo.upsert(db, { date: '2026-03-02', flow: 'light' }, T1);
    await periodDayRepo.upsertMany(
      db,
      [
        { date: '2026-03-03', flow: 'heavy' },
        { date: '2026-03-01', flow: 'medium' },
        { date: '2026-03-02', flow: 'medium' },
      ],
      T2,
    );

    expect(await periodDayRepo.listAll(db)).toEqual([
      { date: '2026-03-01', flow: 'medium', createdAt: T2, updatedAt: T2 },
      { date: '2026-03-02', flow: 'medium', createdAt: T1, updatedAt: T2 },
      { date: '2026-03-03', flow: 'heavy', createdAt: T2, updatedAt: T2 },
    ]);
  });

  it('saves none of the days if one of them is invalid', async () => {
    const invalid = 'unknown' as Flow;
    await expect(
      periodDayRepo.upsertMany(
        db,
        [
          { date: '2026-03-01', flow: 'medium' },
          { date: '2026-03-02', flow: invalid },
        ],
        T1,
      ),
    ).rejects.toThrow();
    expect(await periodDayRepo.listAll(db)).toEqual([]);
  });

  it('lists days between two dates inclusively, oldest first', async () => {
    for (const date of ['2026-03-10', '2026-02-28', '2026-03-01', '2026-03-31', '2026-04-01']) {
      await periodDayRepo.upsert(db, { date, flow: 'spotting' }, T1);
    }

    const days = await periodDayRepo.listBetween(db, '2026-03-01', '2026-03-31');

    expect(days.map((day) => day.date)).toEqual(['2026-03-01', '2026-03-10', '2026-03-31']);
  });
});
