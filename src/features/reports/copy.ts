// Words for the monthly report. Plain counts, calm tone, no judgement (CLAUDE.md §2.3–2.4).
import { format, formatMonth } from '../../lib/date';
import { symptomLabel } from '../symptoms/logic';
import type { MonthReport } from './logic';

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

export function reportTitle({ month }: MonthReport, locale?: string): string {
  return `${formatMonth(month, locale)} at a glance`;
}

export function periodLine(report: MonthReport, locale?: string): string {
  if (report.periodStarts.length === 0) {
    return report.periodDays > 0
      ? `${plural(report.periodDays, 'period day')} logged, continuing from last month.`
      : 'No period started this month.';
  }
  const starts = report.periodStarts
    .map((p) => `${format(p.start, { locale })} (${plural(p.length, 'day')})`)
    .join(', ');
  return `Started ${starts}.`;
}

export function cycleLine({ cyclesEnded }: MonthReport): string | null {
  if (cyclesEnded.length === 0) return null;
  return `Cycle length: ${cyclesEnded.map((n) => plural(n, 'day')).join(', ')}.`;
}

export function symptomLine({ symptomDays }: MonthReport): string {
  return symptomDays === 0
    ? 'No symptoms logged.'
    : `Symptoms logged on ${plural(symptomDays, 'day')}.`;
}

export function sexLine({ sex }: MonthReport): string {
  if (sex.days === 0) return 'No sex logged.';
  return `${plural(sex.days, 'day')}: ${sex.protected} protected, ${sex.unprotected} unprotected.`;
}

export function symptomBarLabel(symptom: keyof typeof symptomLabel, days: number): string {
  return `${symptomLabel[symptom]}, ${plural(days, 'day')}`;
}
