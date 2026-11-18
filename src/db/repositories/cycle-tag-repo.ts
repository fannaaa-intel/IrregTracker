import type { LocalDate } from '../../lib/date';
import type { Db } from '../types';

export type TagReason = 'illness' | 'travel' | 'stress' | 'medication' | 'other';

export type StoredCycleTag = {
  cycleStart: LocalDate;
  reason: TagReason;
  note: string | null;
  /** True = leave this cycle out of predictions (the default when tagging). */
  exclude: boolean;
};

type CycleTagRow = { cycle_start: string; reason: TagReason; note: string | null; exclude: number };

function toTag(row: CycleTagRow): StoredCycleTag {
  return {
    cycleStart: row.cycle_start,
    reason: row.reason,
    note: row.note,
    exclude: row.exclude === 1,
  };
}

export const cycleTagRepo = {
  async listAll(db: Db): Promise<StoredCycleTag[]> {
    const rows = await db.getAllAsync<CycleTagRow>(
      'SELECT cycle_start, reason, note, exclude FROM cycle_tag ORDER BY cycle_start;',
    );
    return rows.map(toTag);
  },

  /** Creates or replaces the tag on the cycle that starts on `cycleStart`. */
  async upsert(db: Db, tag: StoredCycleTag): Promise<void> {
    await db.runAsync(
      `INSERT INTO cycle_tag (cycle_start, reason, note, exclude) VALUES (?, ?, ?, ?)
       ON CONFLICT(cycle_start) DO UPDATE SET
         reason = excluded.reason, note = excluded.note, exclude = excluded.exclude;`,
      [tag.cycleStart, tag.reason, tag.note, tag.exclude ? 1 : 0],
    );
  },

  /** Removes the tag. Returns false if the cycle had none. */
  async delete(db: Db, cycleStart: LocalDate): Promise<boolean> {
    const result = await db.runAsync('DELETE FROM cycle_tag WHERE cycle_start = ?;', [cycleStart]);
    return result.changes > 0;
  },
};
