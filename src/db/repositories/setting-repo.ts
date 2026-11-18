import { isLocalDate, type LocalDate } from '../../lib/date';
import type { Db } from '../types';

// The `setting` table stores one JSON value per key. Each key has a reader that validates
// what comes back, so a bad or old value falls back to a safe default instead of crashing.
const CONFIRMED_SHORT_CYCLES = 'confirmed_short_cycles';

async function readJson(db: Db, key: string): Promise<unknown> {
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM setting WHERE key = ?;',
    [key],
  );
  if (row === null) return null;
  try {
    return JSON.parse(row.value) as unknown;
  } catch {
    return null;
  }
}

async function writeJson(db: Db, key: string, value: unknown): Promise<void> {
  await db.runAsync(
    `INSERT INTO setting (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value;`,
    [key, JSON.stringify(value)],
  );
}

export const settingRepo = {
  /** Start dates of very short cycles she confirmed are real (PLAN.md §5 rule 5). */
  async getConfirmedShortCycles(db: Db): Promise<LocalDate[]> {
    const value = await readJson(db, CONFIRMED_SHORT_CYCLES);
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is LocalDate => typeof item === 'string' && isLocalDate(item));
  },

  async confirmShortCycle(db: Db, cycleStart: LocalDate): Promise<void> {
    const current = await settingRepo.getConfirmedShortCycles(db);
    if (current.includes(cycleStart)) return;
    await writeJson(db, CONFIRMED_SHORT_CYCLES, [...current, cycleStart].sort());
  },
};
