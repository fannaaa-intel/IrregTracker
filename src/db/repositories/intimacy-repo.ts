import { isProtection, type Protection } from '../../features/intimacy/logic';
import type { LocalDate } from '../../lib/date';
import type { Db } from '../types';

export type IntimacyEntry = { date: LocalDate; protection: Protection };

export const intimacyRepo = {
  /** Every logged day, oldest first. */
  async listAll(db: Db): Promise<IntimacyEntry[]> {
    const rows = await db.getAllAsync<{ date: string; protection: string }>(
      'SELECT date, protection FROM intimacy ORDER BY date;',
    );
    return rows.flatMap((row) =>
      isProtection(row.protection) ? [{ date: row.date, protection: row.protection }] : [],
    );
  },

  async set(db: Db, date: LocalDate, protection: Protection): Promise<void> {
    await db.runAsync(
      `INSERT INTO intimacy (date, protection) VALUES (?, ?)
       ON CONFLICT(date) DO UPDATE SET protection = excluded.protection;`,
      [date, protection],
    );
  },

  async delete(db: Db, date: LocalDate): Promise<void> {
    await db.runAsync('DELETE FROM intimacy WHERE date = ?;', [date]);
  },
};
