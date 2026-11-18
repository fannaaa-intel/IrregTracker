// "Summary for a doctor": an on-screen page she can show at an appointment. Pure.
// It stays on her screen: nothing is exported unencrypted (CLAUDE.md §1.5). Facts from her own
// logs only: no diagnosis (CLAUDE.md §2.3). Sex logs are left out; she can mention them herself.
import { addDays, diffDays, type LocalDate } from '../../lib/date';
import { countedCycles } from '../cycles/logic';
import type { CycleOverview } from '../cycles/overview';
import { detectFlags, type HealthFlag } from '../flags/logic';
import { symptomPatterns, type SymptomPattern } from '../insights/logic';
import { SYMPTOMS, type Symptom } from '../symptoms/logic';

/** Recent symptoms and notes cover this many days. */
export const SUMMARY_RECENT_DAYS = 90;
/** The cycle list shows at most this many recent cycles. */
export const SUMMARY_MAX_CYCLES = 12;

export type SummaryCycle = {
  start: LocalDate;
  length: number;
  periodLength: number;
  /** Left out of predictions (tagged, or a very short cycle not confirmed yet). */
  notCounted: boolean;
  tag: string | null;
};

export type DoctorSummary = {
  /** First logged period day, or null with nothing logged. */
  from: LocalDate | null;
  today: LocalDate;
  overview: CycleOverview;
  current: { start: LocalDate; day: number } | null;
  cycles: SummaryCycle[];
  flags: HealthFlag[];
  /** Symptom days in the last SUMMARY_RECENT_DAYS, most frequent first. */
  recentSymptoms: { symptom: Symptom; days: number }[];
  patterns: SymptomPattern[];
  /** Notes in the last SUMMARY_RECENT_DAYS, newest first. */
  notes: { date: LocalDate; body: string }[];
};

type Inputs = {
  overview: CycleOverview;
  firstLogged: LocalDate | null;
  symptoms: readonly { date: LocalDate; type: Symptom }[];
  notes: readonly { date: LocalDate; body: string }[];
  today: LocalDate;
};

export function buildDoctorSummary({
  overview,
  firstLogged,
  symptoms,
  notes,
  today,
}: Inputs): DoctorSummary {
  const { history, tags } = overview;
  const since = addDays(today, -(SUMMARY_RECENT_DAYS - 1));
  const recent = <T extends { date: LocalDate }>(rows: readonly T[]) =>
    rows.filter((r) => r.date >= since && r.date <= today);

  const counted = new Set(countedCycles(history.closed, tags).map((c) => c.start));
  const tagByStart = new Map(tags.map((t) => [t.cycleStart, t.reason]));

  const counts = new Map<Symptom, number>();
  for (const entry of recent(symptoms)) counts.set(entry.type, (counts.get(entry.type) ?? 0) + 1);

  return {
    from: firstLogged,
    today,
    overview,
    current:
      history.open === null
        ? null
        : { start: history.open.start, day: diffDays(today, history.open.start) + 1 },
    cycles: history.closed.slice(0, SUMMARY_MAX_CYCLES).map((c) => ({
      start: c.start,
      length: c.length,
      periodLength: c.period.length,
      notCounted: !counted.has(c.start),
      tag: tagByStart.get(c.start) ?? null,
    })),
    flags: detectFlags(history, tags, today),
    recentSymptoms: SYMPTOMS.filter((s) => counts.has(s))
      .map((symptom) => ({ symptom, days: counts.get(symptom) ?? 0 }))
      .sort((a, b) => b.days - a.days),
    patterns: symptomPatterns(history, symptoms),
    notes: [...recent(notes)].sort((a, b) => (a.date < b.date ? 1 : -1)),
  };
}
