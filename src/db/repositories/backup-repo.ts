import type { Db } from '../types';

// Whole-database snapshot for encrypted backups (features/backup). SQL stays here (CLAUDE.md §4.2).
export type DbSnapshot = {
  schemaVersion: number;
  periodDays: { date: string; flow: string; createdAt: string; updatedAt: string }[];
  cycleTags: { cycleStart: string; reason: string; note: string | null; exclude: boolean }[];
  settings: { key: string; value: string }[];
};

type DayRow = { date: string; flow: string; created_at: string; updated_at: string };
type TagRow = { cycle_start: string; reason: string; note: string | null; exclude: number };

export const backupRepo = {
  /** Every row, except settings in `skipSettings` (device-only, such as app lock). */
  async readAll(db: Db, skipSettings: readonly string[] = []): Promise<DbSnapshot> {
    const version = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
    const days = await db.getAllAsync<DayRow>(
      'SELECT date, flow, created_at, updated_at FROM period_day ORDER BY date;',
    );
    const tags = await db.getAllAsync<TagRow>(
      'SELECT cycle_start, reason, note, exclude FROM cycle_tag ORDER BY cycle_start;',
    );
    const settings = await db.getAllAsync<{ key: string; value: string }>(
      'SELECT key, value FROM setting ORDER BY key;',
    );
    return {
      schemaVersion: version?.user_version ?? 0,
      periodDays: days.map((r) => ({
        date: r.date,
        flow: r.flow,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })),
      cycleTags: tags.map((r) => ({
        cycleStart: r.cycle_start,
        reason: r.reason,
        note: r.note,
        exclude: r.exclude === 1,
      })),
      settings: settings.filter((s) => !skipSettings.includes(s.key)),
    };
  },

  /**
   * Replaces all data with the snapshot in one transaction: everything is restored, or nothing
   * changes. Settings in `keepSettings` (device-only) keep their current values.
   */
  async replaceAll(db: Db, data: DbSnapshot, keepSettings: readonly string[] = []): Promise<void> {
    await db.withExclusiveTransactionAsync(async (txn) => {
      await txn.runAsync('DELETE FROM period_day;');
      await txn.runAsync('DELETE FROM cycle_tag;');
      const placeholders = keepSettings.map(() => '?').join(', ');
      await txn.runAsync(
        keepSettings.length > 0
          ? `DELETE FROM setting WHERE key NOT IN (${placeholders});`
          : 'DELETE FROM setting;',
        [...keepSettings],
      );
      for (const d of data.periodDays) {
        await txn.runAsync(
          'INSERT INTO period_day (date, flow, created_at, updated_at) VALUES (?, ?, ?, ?);',
          [d.date, d.flow, d.createdAt, d.updatedAt],
        );
      }
      for (const t of data.cycleTags) {
        await txn.runAsync(
          'INSERT INTO cycle_tag (cycle_start, reason, note, exclude) VALUES (?, ?, ?, ?);',
          [t.cycleStart, t.reason, t.note, t.exclude ? 1 : 0],
        );
      }
      for (const s of data.settings) {
        if (keepSettings.includes(s.key)) continue;
        await txn.runAsync('INSERT INTO setting (key, value) VALUES (?, ?);', [s.key, s.value]);
      }
    });
  },
};
