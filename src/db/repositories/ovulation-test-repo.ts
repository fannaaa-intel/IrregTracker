import { isTestResult, type TestResult } from '../../features/fertility/tests';
import type { LocalDate } from '../../lib/date';
import type { Db } from '../types';

export type OvulationTestEntry = { date: LocalDate; result: TestResult };

/** Ovulation (LH) test results, one per day. */
export const ovulationTestRepo = {
  /** Every logged test, oldest first. */
  async listAll(db: Db): Promise<OvulationTestEntry[]> {
    const rows = await db.getAllAsync<{ date: string; result: string }>(
      'SELECT date, result FROM ovulation_test ORDER BY date;',
    );
    return rows.flatMap((row) =>
      isTestResult(row.result) ? [{ date: row.date, result: row.result }] : [],
    );
  },

  async set(db: Db, date: LocalDate, result: TestResult): Promise<void> {
    await db.runAsync(
      `INSERT INTO ovulation_test (date, result) VALUES (?, ?)
       ON CONFLICT(date) DO UPDATE SET result = excluded.result;`,
      [date, result],
    );
  },

  async delete(db: Db, date: LocalDate): Promise<void> {
    await db.runAsync('DELETE FROM ovulation_test WHERE date = ?;', [date]);
  },
};
