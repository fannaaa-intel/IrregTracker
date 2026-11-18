import { hasNodeSqlite, openMemoryDb } from './test-utils/memory-db';
import { runInTransaction } from './transaction';
import type { Db } from './types';

const describeSql = hasNodeSqlite ? describe : describe.skip;

describeSql('runInTransaction', () => {
  let db: Db;

  beforeEach(async () => {
    db = openMemoryDb();
    await db.execAsync('CREATE TABLE t (n INTEGER PRIMARY KEY);');
  });

  afterEach(async () => {
    await db.closeAsync();
  });

  const count = async () =>
    (await db.getFirstAsync<{ c: number }>('SELECT count(*) AS c FROM t;'))?.c;

  it('commits on success and returns the result', async () => {
    const result = await runInTransaction(db, async (txn) => {
      await txn.runAsync('INSERT INTO t (n) VALUES (1);');
      return 'done';
    });
    expect(result).toBe('done');
    expect(await count()).toBe(1);
  });

  it('rolls back everything when the task throws', async () => {
    await expect(
      runInTransaction(db, async (txn) => {
        await txn.runAsync('INSERT INTO t (n) VALUES (1);');
        throw new Error('stop');
      }),
    ).rejects.toThrow('stop');
    expect(await count()).toBe(0);
  });

  it('runs overlapping transactions one after another, never nested', async () => {
    const order: string[] = [];
    const slow = runInTransaction(db, async (txn) => {
      order.push('a-start');
      await new Promise((r) => setTimeout(r, 10));
      await txn.runAsync('INSERT INTO t (n) VALUES (1);');
      order.push('a-end');
    });
    const fast = runInTransaction(db, async (txn) => {
      order.push('b-start');
      await txn.runAsync('INSERT INTO t (n) VALUES (2);');
      order.push('b-end');
    });
    await Promise.all([slow, fast]);
    expect(order).toEqual(['a-start', 'a-end', 'b-start', 'b-end']);
    expect(await count()).toBe(2);
  });

  it('keeps working after a failed transaction', async () => {
    await runInTransaction(db, async () => {
      throw new Error('first fails');
    }).catch(() => undefined);
    await runInTransaction(db, async (txn) => {
      await txn.runAsync('INSERT INTO t (n) VALUES (3);');
    });
    expect(await count()).toBe(1);
  });
});
