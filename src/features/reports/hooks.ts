import type { LocalDate } from '../../lib/date';
import { useCycleOverview, usePeriodDays } from '../cycles/hooks';
import { useNotes } from '../notes/hooks';
import { useSymptomEntries } from '../symptoms/hooks';
import { buildDoctorSummary, type DoctorSummary } from './doctor';

/** The doctor summary from her latest logs, or undefined while loading. */
export function useDoctorSummary(today: LocalDate): DoctorSummary | undefined {
  const overview = useCycleOverview(today);
  const days = usePeriodDays();
  const symptoms = useSymptomEntries();
  const notes = useNotes();
  if (
    overview === undefined ||
    days === undefined ||
    symptoms === undefined ||
    notes === undefined
  ) {
    return undefined;
  }
  return buildDoctorSummary({
    overview,
    firstLogged: days[0]?.date ?? null,
    symptoms,
    notes,
    today,
  });
}
