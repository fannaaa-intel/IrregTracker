import type { LocalDate } from '../../lib/date';
import type { Flow } from '../../theme';
import type { Db } from '../types';

export type PeriodDay = {
  date: LocalDate;
  flow: Flow;
  createdAt: string;
  updatedAt: string;
};

type PeriodDayRow = {
  date: string;
  flow: Flow;
  created_at: string;
  updated_at: string;
};

function toPeriodDay(row: PeriodDayRow): PeriodDay {
  return { date: row.date, flow: row.flow, createdAt: row.created_at, updatedAt: row.updated_at };
}

// Record-keeping timestamps (UTC instants), never used as health dates (CLAUDE.md §3).
function nowTimestamp(): string {
  return new Date().toISOString();
}

export const periodDayRepo = {
  /** Marks a day as a period day, or changes its flow. Keeps the original created_at. */
  async upsert(
    db: Db,
    day: { date: LocalDate; flow: Flow },
    now: string = nowTimestamp(),
  ): Promise<void> {
    await db.runAsync(
      `INSERT INTO period_day (date, flow, created_at, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(date) DO UPDATE SET flow = excluded.flow, updated_at = excluded.updated_at;`,
      [day.date, day.flow, now, now],
    );
  },

  /** Removes a period day. Returns false if the day wasn't logged. */
  async delete(db: Db, date: LocalDate): Promise<boolean> {
    const result = await db.runAsync('DELETE FROM period_day WHERE date = ?;', [date]);
    return result.changes > 0;
  },

  /** Period days from `from` to `to`, both inclusive, oldest first. */
  async listBetween(db: Db, from: LocalDate, to: LocalDate): Promise<PeriodDay[]> {
    const rows = await db.getAllAsync<PeriodDayRow>(
      `SELECT date, flow, created_at, updated_at
       FROM period_day
       WHERE date BETWEEN ? AND ?
       ORDER BY date;`,
      [from, to],
    );
    return rows.map(toPeriodDay);
  },
};
