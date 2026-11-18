import type { LocalDate } from '../../lib/date';
import { isSymptom, type Symptom } from '../../features/symptoms/logic';
import { runInTransaction } from '../transaction';
import type { Db } from '../types';

export type SymptomEntry = { date: LocalDate; type: Symptom };

export const symptomRepo = {
  /** Every logged symptom, oldest first. Unknown types (from a newer app) are skipped. */
  async listAll(db: Db): Promise<SymptomEntry[]> {
    const rows = await db.getAllAsync<{ date: string; type: string }>(
      'SELECT date, type FROM symptom ORDER BY date, type;',
    );
    return rows.flatMap((row) => (isSymptom(row.type) ? [{ date: row.date, type: row.type }] : []));
  },

  /** Replaces the symptoms logged on `date` with exactly `types` (empty clears the day). */
  async setForDate(db: Db, date: LocalDate, types: readonly Symptom[]): Promise<void> {
    await runInTransaction(db, async (txn) => {
      await txn.runAsync('DELETE FROM symptom WHERE date = ?;', [date]);
      for (const type of types) {
        await txn.runAsync('INSERT INTO symptom (date, type) VALUES (?, ?);', [date, type]);
      }
    });
  },
};
