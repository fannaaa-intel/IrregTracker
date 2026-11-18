import type { Db } from './types';
import { DbOpenError } from './errors';
import { migrations, runMigrations, type Migration } from './migrations';
import { hasNodeSqlite, openMemoryDb } from './test-utils/memory-db';

const describeSql = hasNodeSqlite ? describe : describe.skip;

async function userVersion(db: Db): Promise<number> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
  return row?.user_version ?? -1;
}

async function tableNames(db: Db): Promise<string[]> {
  const rows = await db.getAllAsync<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name;",
  );
  return rows.map((row) => row.name);
}

describeSql('runMigrations', () => {
  let db: Db;

  beforeEach(() => {
    db = openMemoryDb();
  });

  afterEach(async () => {
    await db.closeAsync();
  });

  it('creates the v1 tables on a fresh database and sets user_version', async () => {
    await expect(runMigrations(db)).resolves.toBe(migrations.length);
    expect(await userVersion(db)).toBe(1);
    expect(await tableNames(db)).toEqual(['cycle_tag', 'period_day', 'setting']);
  });

  it('is a no-op when the database is already up to date', async () => {
    await runMigrations(db);
    await expect(runMigrations(db)).resolves.toBe(1);
    expect(await userVersion(db)).toBe(1);
  });

  it('runs only the steps newer than user_version', async () => {
    const steps: Migration[] = [
      { version: 1, up: 'CREATE TABLE a (id INTEGER);' },
      { version: 2, up: 'CREATE TABLE b (id INTEGER);' },
    ];
    await runMigrations(db, steps.slice(0, 1));
    await expect(runMigrations(db, steps)).resolves.toBe(2);
    expect(await tableNames(db)).toEqual(['a', 'b']);
  });

  it('rolls back a failing step and leaves user_version unchanged', async () => {
    const steps: Migration[] = [
      { version: 1, up: 'CREATE TABLE a (id INTEGER); CREATE TABLE a (id INTEGER);' },
    ];
    await expect(runMigrations(db, steps)).rejects.toThrow();
    expect(await userVersion(db)).toBe(0);
    expect(await tableNames(db)).toEqual([]);
  });

  it('refuses a database written by a newer app version', async () => {
    await db.execAsync('PRAGMA user_version = 99;');
    const result = runMigrations(db);
    await expect(result).rejects.toBeInstanceOf(DbOpenError);
    await expect(result).rejects.toMatchObject({ kind: 'schema' });
  });

  it('rejects migration lists with gaps in their versions', async () => {
    const steps: Migration[] = [{ version: 2, up: 'SELECT 1;' }];
    await expect(runMigrations(db, steps)).rejects.toThrow('expected 1');
  });
});
