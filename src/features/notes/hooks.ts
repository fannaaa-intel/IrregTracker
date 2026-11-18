import { useDb } from '../../db/DatabaseProvider';
import { notifyDbChange, useLiveQuery } from '../../db/live-query';
import { noteRepo, type NoteEntry } from '../../db/repositories/note-repo';
import type { LocalDate } from '../../lib/date';
import { normalizeNote } from './logic';

/** Every note, kept up to date after each write. */
export function useNotes(): NoteEntry[] | undefined {
  return useLiveQuery((db) => noteRepo.listAll(db));
}

/** The note on `date` ('' when none, undefined while loading) and a save that trims or removes. */
export function useDayNote(date: LocalDate) {
  const db = useDb();
  const notes = useNotes();
  const note = notes === undefined ? undefined : (notes.find((n) => n.date === date)?.body ?? '');

  return {
    note,
    save: async (text: string) => {
      const body = normalizeNote(text);
      if (body === null) await noteRepo.delete(db, date);
      else await noteRepo.set(db, date, body);
      notifyDbChange();
    },
  };
}
