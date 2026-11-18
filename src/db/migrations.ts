import type { Db } from './types';
import { DbOpenError } from './errors';
import { runInTransaction } from './transaction';

// Schema migrations tracked with PRAGMA user_version (CLAUDE.md §4.7).
// Append new steps only. Never edit a step that has shipped.
export type Migration = {
  version: number;
  up: string;
};

export const migrations: readonly Migration[] = [
  {
    version: 1,
    up: `
      CREATE TABLE period_day (
        date        TEXT PRIMARY KEY,
        flow        TEXT NOT NULL CHECK (flow IN ('spotting','light','medium','heavy')),
        created_at  TEXT NOT NULL,
        updated_at  TEXT NOT NULL
      );

      CREATE TABLE cycle_tag (
        cycle_start TEXT PRIMARY KEY,
        reason      TEXT NOT NULL CHECK (reason IN ('illness','travel','stress','medication','other')),
        note        TEXT,
        exclude     INTEGER NOT NULL DEFAULT 1
      );

      CREATE TABLE setting (
        key   TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `,
  },
  {
    // Nov 18, 2026: daily symptoms and intimacy (her feedback). Types are validated in code, so
    // new symptom names never need a migration.
    version: 2,
    up: `
      CREATE TABLE symptom (
        date  TEXT NOT NULL,
        type  TEXT NOT NULL,
        PRIMARY KEY (date, type)
      );

      CREATE TABLE intimacy (
        date        TEXT PRIMARY KEY,
        protection  TEXT NOT NULL CHECK (protection IN ('protected','unprotected'))
      );
    `,
  },
];

function assertSequential(steps: readonly Migration[]): void {
  steps.forEach((step, index) => {
    if (step.version !== index + 1) {
      throw new Error(`Migration ${index} has version ${step.version}; expected ${index + 1}.`);
    }
  });
}

/** Runs every step newer than the file's user_version, each in its own transaction. */
export async function runMigrations(
  db: Db,
  steps: readonly Migration[] = migrations,
): Promise<number> {
  assertSequential(steps);
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
  let current = row?.user_version ?? 0;

  if (current > steps.length) {
    throw new DbOpenError('schema', `Database version ${current} is newer than this app.`);
  }

  for (const step of steps.slice(current)) {
    await runInTransaction(db, async (txn) => {
      await txn.execAsync(step.up);
      await txn.execAsync(`PRAGMA user_version = ${step.version};`);
    });
    current = step.version;
  }
  return current;
}
