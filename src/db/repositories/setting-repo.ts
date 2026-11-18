import { isLocalDate, type LocalDate } from '../../lib/date';
import type { Db } from '../types';

// The `setting` table stores one JSON value per key. Each key has a reader that validates
// what comes back, so a bad or old value falls back to a safe default instead of crashing.
const CONFIRMED_SHORT_CYCLES = 'confirmed_short_cycles';
const DISMISSED_FLAGS = 'dismissed_flags';
const ONBOARDING_DONE = 'onboarding_done';
const KIND_NOTES = 'kind_notes';

/** `time` is 'surprise' or an hour of day (0–23). */
export type StoredKindNotes = { enabled: boolean; time: 'surprise' | number };

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

  /** IDs of flag cards she dismissed (`type:cycleStart`, see features/flags/logic.ts). */
  async getDismissedFlags(db: Db): Promise<string[]> {
    const value = await readJson(db, DISMISSED_FLAGS);
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is string => typeof item === 'string');
  },

  async dismissFlag(db: Db, flagId: string): Promise<void> {
    const current = await settingRepo.getDismissedFlags(db);
    if (current.includes(flagId)) return;
    await writeJson(db, DISMISSED_FLAGS, [...current, flagId].sort());
  },

  async isOnboardingDone(db: Db): Promise<boolean> {
    return (await readJson(db, ONBOARDING_DONE)) === true;
  },

  async setOnboardingDone(db: Db): Promise<void> {
    await writeJson(db, ONBOARDING_DONE, true);
  },

  /** Daily kind-note settings, or null when never set or unreadable. */
  async getKindNotes(db: Db): Promise<StoredKindNotes | null> {
    const value = await readJson(db, KIND_NOTES);
    if (typeof value !== 'object' || value === null) return null;
    const { enabled, time } = value as Record<string, unknown>;
    if (typeof enabled !== 'boolean') return null;
    if (time === 'surprise') return { enabled, time };
    if (typeof time !== 'number' || !Number.isInteger(time) || time < 0 || time > 23) return null;
    return { enabled, time };
  },

  async setKindNotes(db: Db, settings: StoredKindNotes): Promise<void> {
    await writeJson(db, KIND_NOTES, settings);
  },
};
