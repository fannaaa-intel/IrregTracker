import type { LocalDate } from '../../lib/date';
import type { Db } from '../types';

export type NoteEntry = { date: LocalDate; body: string };

/** Daily notes. The text is health data: never log it (CLAUDE.md §1.3). */
export const noteRepo = {
  /** Every note, oldest first. */
  async listAll(db: Db): Promise<NoteEntry[]> {
    return db.getAllAsync<NoteEntry>('SELECT date, body FROM note ORDER BY date;');
  },

  /** Saves the note for `date`, replacing any earlier one. */
  async set(db: Db, date: LocalDate, body: string): Promise<void> {
    await db.runAsync(
      `INSERT INTO note (date, body) VALUES (?, ?)
       ON CONFLICT(date) DO UPDATE SET body = excluded.body;`,
      [date, body],
    );
  },

  async delete(db: Db, date: LocalDate): Promise<void> {
    await db.runAsync('DELETE FROM note WHERE date = ?;', [date]);
  },
};
