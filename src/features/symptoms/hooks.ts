import { useDb } from '../../db/DatabaseProvider';
import { notifyDbChange, useLiveQuery } from '../../db/live-query';
import { symptomRepo, type SymptomEntry } from '../../db/repositories/symptom-repo';
import type { LocalDate } from '../../lib/date';
import { toggleSymptom, type Symptom } from './logic';

/** Every logged symptom, kept up to date after each write. */
export function useSymptomEntries(): SymptomEntry[] | undefined {
  return useLiveQuery((db) => symptomRepo.listAll(db));
}

/** The symptoms logged on `date` (undefined while loading), and a toggle that saves at once. */
export function useDaySymptoms(date: LocalDate) {
  const db = useDb();
  const entries = useSymptomEntries();
  const symptoms = entries?.filter((e) => e.date === date).map((e) => e.type);

  return {
    symptoms,
    toggle: async (symptom: Symptom) => {
      if (symptoms === undefined) return;
      await symptomRepo.setForDate(db, date, toggleSymptom(symptoms, symptom));
      notifyDbChange();
    },
  };
}
