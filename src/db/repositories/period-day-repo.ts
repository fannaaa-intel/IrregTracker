import type { LocalDate } from '../../lib/date';
import type { Flow } from '../../theme';
import { runInTransaction } from '../transaction';
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

const UPSERT_SQL = `INSERT INTO period_day (date, flow, created_at, updated_at)
  VALUES (?, ?, ?, ?)
  ON CONFLICT(date) DO UPDATE SET flow = excluded.flow, updated_at = excluded.updated_at;`;

const SELECT_COLUMNS = 'SELECT date, flow, created_at, updated_at FROM period_day';

export const periodDayRepo = {
  /** Marks a day as a period day, or changes its flow. Keeps the original created_at. */
  async upsert(
    db: Db,
    day: { date: LocalDate; flow: Flow },
    now: string = nowTimestamp(),
  ): Promise<void> {
    await db.runAsync(UPSERT_SQL, [day.date, day.flow, now, now]);
  },

  /** Upserts several days in one transaction: all of them are saved, or none (backfill). */
  async upsertMany(
    db: Db,
    days: readonly { date: LocalDate; flow: Flow }[],
    now: string = nowTimestamp(),
  ): Promise<void> {
    await runInTransaction(db, async (txn) => {
      for (const day of days) {
        await txn.runAsync(UPSERT_SQL, [day.date, day.flow, now, now]);
      }
    });
  },

  /** Every logged period day, oldest first. Small: one row per logged day. */
  async listAll(db: Db): Promise<PeriodDay[]> {
    const rows = await db.getAllAsync<PeriodDayRow>(`${SELECT_COLUMNS} ORDER BY date;`);
    return rows.map(toPeriodDay);
  },

  /** Removes a period day. Returns false if the day wasn't logged. */
  async delete(db: Db, date: LocalDate): Promise<boolean> {
    const result = await db.runAsync('DELETE FROM period_day WHERE date = ?;', [date]);
    return result.changes > 0;
  },

  /** Period days from `from` to `to`, both inclusive, oldest first. */
  async listBetween(db: Db, from: LocalDate, to: LocalDate): Promise<PeriodDay[]> {
    const rows = await db.getAllAsync<PeriodDayRow>(
      `${SELECT_COLUMNS} WHERE date BETWEEN ? AND ? ORDER BY date;`,
      [from, to],
    );
    return rows.map(toPeriodDay);
  },
};
