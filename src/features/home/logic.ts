// Home's small words: a greeting, a phase hint and what's logged today. Pure.
import { diffDays, type LocalDate } from '../../lib/date';
import type { Flow } from '../../theme';
import type { OpenCycle } from '../cycles/logic';
import { inRange, type FertileEstimate } from '../fertility/logic';
import type { Protection } from '../intimacy/logic';
import { flowLabel } from '../logging/logic';
import type { Prediction } from '../prediction/logic';
import { symptomList, type Symptom } from '../symptoms/logic';

/** A calm greeting for the hour on the phone's clock (0–23). */
export function greetingFor(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 18) return 'Good afternoon';
  if (hour >= 18 && hour < 23) return 'Good evening';
  return 'Hello';
}

export type TodayLog = {
  flow: Flow | null;
  symptoms: readonly Symptom[];
  protection: Protection | null;
};

/** Short lines for the Today card, e.g. ["Medium flow", "Cramps and bloating", "Sex, protected"]. */
export function todayLines({ flow, symptoms, protection }: TodayLog): string[] {
  const lines: string[] = [];
  if (flow !== null) lines.push(flow === 'spotting' ? 'Spotting' : `${flowLabel[flow]} flow`);
  if (symptoms.length > 0) {
    const text = symptomList(symptoms);
    lines.push(text.charAt(0).toUpperCase() + text.slice(1));
  }
  if (protection !== null) lines.push(`Sex, ${protection}`);
  return lines;
}

export type PhaseHint = {
  kind: 'period' | 'soon' | 'any-day' | 'late' | 'ovulation' | 'fertile' | 'learning' | 'cycle';
  text: string;
};

type HintInput = {
  today: LocalDate;
  prediction: Prediction;
  open: OpenCycle | null;
  /** Null when fertile days are off or unknown. */
  fertile: FertileEstimate | null;
};

const days = (n: number) => `${n} day${n === 1 ? '' : 's'}`;

/**
 * One short line under the ring that changes with the cycle. Always ranges, never a single
 * predicted date (CLAUDE.md §2.1); calm wording only.
 */
export function phaseHint({ today, prediction, open, fertile }: HintInput): PhaseHint | null {
  if (open === null) return null;
  const day = diffDays(today, open.start) + 1;
  if (day >= 1 && diffDays(open.period.end, today) >= 0) {
    return { kind: 'period', text: `Period day ${day}` };
  }
  if (inRange(today, fertile?.ovulation ?? null)) {
    return { kind: 'ovulation', text: 'Likely ovulation days' };
  }
  if (inRange(today, fertile?.fertile ?? null)) {
    return { kind: 'fertile', text: 'Possible fertile day' };
  }
  if (prediction.state === 'learning')
    return { kind: 'learning', text: 'Still learning your cycle' };
  if (prediction.daysLate > 0) return { kind: 'late', text: 'Your period could start any day' };
  const toStart = diffDays(prediction.window.start, today);
  const toEnd = diffDays(prediction.window.end, today);
  if (toStart <= 0) return { kind: 'any-day', text: 'Your period could start any day now' };
  if (toStart <= 14) {
    return { kind: 'soon', text: `Period likely in ${toStart}–${days(toEnd)}` };
  }
  return { kind: 'cycle', text: `Day ${day} of your cycle` };
}
