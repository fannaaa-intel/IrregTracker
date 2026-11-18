// Test-only: a real (unencrypted, in-memory) SQLite via Node's built-in `node:sqlite`, wrapped in
// the subset of the expo-sqlite API our db code uses. Lets tests run the actual SQL.
// Returns null on Node versions without `node:sqlite`; tests then skip.
import type { Db } from '../types';

type Param = string | number | null;
type NodeStatement = {
  get(...params: Param[]): unknown;
  all(...params: Param[]): unknown[];
  run(...params: Param[]): { changes: number | bigint; lastInsertRowid: number | bigint };
};
type NodeDatabase = {
  exec(sql: string): void;
  prepare(sql: string): NodeStatement;
  close(): void;
};

function loadNodeSqlite(): (new (path: string) => NodeDatabase) | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return (require('node:sqlite') as { DatabaseSync: new (path: string) => NodeDatabase })
      .DatabaseSync;
  } catch {
    return null;
  }
}

const DatabaseSync = loadNodeSqlite();
export const hasNodeSqlite = DatabaseSync !== null;

function flatten(params: unknown[]): Param[] {
  const list = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
  return list as Param[];
}

export function openMemoryDb(): Db {
  if (DatabaseSync === null) {
    throw new Error('node:sqlite is not available in this Node version');
  }
  const raw = new DatabaseSync(':memory:');

  const db = {
    execAsync: async (sql: string) => raw.exec(sql),
    getFirstAsync: async (sql: string, ...params: unknown[]) =>
      raw.prepare(sql).get(...flatten(params)) ?? null,
    getAllAsync: async (sql: string, ...params: unknown[]) =>
      raw.prepare(sql).all(...flatten(params)),
    runAsync: async (sql: string, ...params: unknown[]) => {
      const result = raw.prepare(sql).run(...flatten(params));
      return { changes: Number(result.changes), lastInsertRowId: Number(result.lastInsertRowid) };
    },
    withExclusiveTransactionAsync: async (task: (txn: unknown) => Promise<void>) => {
      raw.exec('BEGIN EXCLUSIVE');
      try {
        await task(db);
        raw.exec('COMMIT');
      } catch (error) {
        raw.exec('ROLLBACK');
        throw error;
      }
    },
    closeAsync: async () => raw.close(),
  };
  return db as unknown as Db;
}
