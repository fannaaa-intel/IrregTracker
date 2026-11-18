// "This month at a glance" under the calendar (her feedback: a report for each month). Pure.
// Counts what she logged, nothing more: no scores, no judgements, no diagnosis (CLAUDE.md §2.3).
import { monthOf, type LocalDate, type Month } from '../../lib/date';
import type { CycleHistory, PeriodDayInput } from '../cycles/logic';
import type { Protection } from '../intimacy/logic';
import { SYMPTOMS, type Symptom } from '../symptoms/logic';

export type MonthReport = {
  month: Month;
  /** Periods that started this month, with their length in days. */
  periodStarts: { start: LocalDate; length: number }[];
  /** Logged bleeding days this month, not counting spotting. */
  periodDays: number;
  spottingDays: number;
  /** Cycles that ended this month (the next period started in it), with their length. */
  cyclesEnded: number[];
  /** Days with at least one symptom. */
  symptomDays: number;
  /** Each logged symptom and on how many days, most frequent first. */
  symptoms: { symptom: Symptom; days: number }[];
  sex: { days: number; protected: number; unprotected: number };
  /** Nothing at all was logged this month. */
  empty: boolean;
};

type Inputs = {
  days: readonly PeriodDayInput[];
  history: CycleHistory;
  symptoms: readonly { date: LocalDate; type: Symptom }[];
  intimacy: readonly { date: LocalDate; protection: Protection }[];
};

const sameMonth = (date: LocalDate, month: Month) => {
  const m = monthOf(date);
  return m.year === month.year && m.month === month.month;
};

export function summarizeMonth(
  month: Month,
  { days, history, symptoms, intimacy }: Inputs,
): MonthReport {
  const inMonth = <T extends { date: LocalDate }>(rows: readonly T[]) =>
    rows.filter((row) => sameMonth(row.date, month));

  const monthDays = inMonth(days);
  const periods = [
    ...history.closed.map((c) => c.period),
    ...(history.open ? [history.open.period] : []),
  ];
  const periodStarts = periods
    .filter((p) => sameMonth(p.start, month))
    .map((p) => ({ start: p.start, length: p.length }))
    .sort((a, b) => (a.start < b.start ? -1 : 1));

  const monthSymptoms = inMonth(symptoms);
  const counts = new Map<Symptom, number>();
  for (const entry of monthSymptoms) counts.set(entry.type, (counts.get(entry.type) ?? 0) + 1);
  const ranked = SYMPTOMS.filter((s) => counts.has(s))
    .map((symptom) => ({ symptom, days: counts.get(symptom) ?? 0 }))
    .sort((a, b) => b.days - a.days); // stable: ties keep display order

  const monthSex = inMonth(intimacy);
  const protectedDays = monthSex.filter((d) => d.protection === 'protected').length;

  const report: MonthReport = {
    month,
    periodStarts,
    periodDays: monthDays.filter((d) => d.flow !== 'spotting').length,
    spottingDays: monthDays.filter((d) => d.flow === 'spotting').length,
    cyclesEnded: history.closed
      .filter((c) => sameMonth(c.nextStart, month))
      .map((c) => c.length)
      .reverse(),
    symptomDays: new Set(monthSymptoms.map((s) => s.date)).size,
    symptoms: ranked,
    sex: {
      days: monthSex.length,
      protected: protectedDays,
      unprotected: monthSex.length - protectedDays,
    },
    empty: false,
  };
  report.empty = monthDays.length === 0 && monthSymptoms.length === 0 && monthSex.length === 0;
  return report;
}
