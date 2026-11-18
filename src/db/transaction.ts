import type { Db } from './types';

// Every transaction goes through here. Do NOT use expo-sqlite's withExclusiveTransactionAsync:
// it opens a second native connection that never receives `PRAGMA key`, so on a SQLCipher file
// it fails ("file is not a database"). This broke the first launch of v1.2.0 on a real phone.
// Instead we use the one keyed connection and queue transactions in JS so they never interleave.
let queue: Promise<unknown> = Promise.resolve();

/** Runs `task` in BEGIN IMMEDIATE … COMMIT on the keyed connection; rolls back if it throws. */
export function runInTransaction<T>(db: Db, task: (db: Db) => Promise<T>): Promise<T> {
  const run = async (): Promise<T> => {
    await db.execAsync('BEGIN IMMEDIATE;');
    try {
      const result = await task(db);
      await db.execAsync('COMMIT;');
      return result;
    } catch (error) {
      try {
        await db.execAsync('ROLLBACK;');
      } catch {
        // SQLite may already have rolled back; keep the original error.
      }
      throw error;
    }
  };
  const next = queue.then(run, run);
  queue = next.catch(() => undefined);
  return next;
}
