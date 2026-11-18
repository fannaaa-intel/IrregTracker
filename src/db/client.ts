import { deleteDatabaseAsync, openDatabaseAsync } from 'expo-sqlite';

import { DbOpenError } from './errors';
import { deleteDbKey, getOrCreateDbKey } from './key-service';
import { runMigrations } from './migrations';
import type { Db } from './types';

export type { Db } from './types';

// The ONLY place the database is opened (CLAUDE.md §1.2). Everything else gets it via useDb().
const DB_NAME = 'cycle.db';

async function verifyCipher(db: Db): Promise<void> {
  // Without SQLCipher compiled in, PRAGMA key is silently ignored and this returns nothing.
  const row = await db.getFirstAsync<{ cipher_version?: string }>('PRAGMA cipher_version;');
  if (!row?.cipher_version) {
    throw new DbOpenError('not-encrypted', 'SQLCipher is unavailable; refusing to open the DB.');
  }
}

async function verifyKey(db: Db): Promise<void> {
  // SQLCipher only decrypts on first read, so a wrong key surfaces here.
  try {
    await db.getFirstAsync('SELECT count(*) AS n FROM sqlite_master;');
  } catch {
    throw new DbOpenError('key', 'The database key does not open this file.');
  }
}

/** Opens the encrypted DB, verifies encryption and key, and runs migrations. */
export async function openEncryptedDb(): Promise<Db> {
  const key = await getOrCreateDbKey();
  const db = await openDatabaseAsync(DB_NAME);
  try {
    // Must be the first statement on the connection. `x'…'` passes the raw 32-byte key, so
    // SQLCipher skips passphrase derivation. `key` is validated 64-char hex, safe to inline.
    await db.execAsync(`PRAGMA key = "x'${key}'";`);
    await verifyCipher(db);
    await verifyKey(db);
    await db.execAsync('PRAGMA journal_mode = WAL;');
    await runMigrations(db);
    return db;
  } catch (error) {
    await db.closeAsync().catch(() => undefined);
    throw error;
  }
}

let opening: Promise<Db> | null = null;

/** Shared connection. A failed open is not cached, so a later call can retry. */
export function getDb(): Promise<Db> {
  if (opening === null) {
    opening = openEncryptedDb().catch((error: unknown) => {
      opening = null;
      throw error;
    });
  }
  return opening;
}

/**
 * Delete all data (PLAN.md §8): closes the connection, deletes the database file and its key.
 * The app must restart afterwards; the next launch creates a fresh key and an empty database.
 */
export async function wipeDatabase(): Promise<void> {
  const current = opening;
  opening = null;
  if (current !== null) {
    const db = await current.catch(() => null);
    await db?.closeAsync().catch(() => undefined);
  }
  // If the file can't be deleted, stop before the key goes: the data must stay openable.
  await deleteDatabaseAsync(DB_NAME);
  await deleteDbKey();
}
