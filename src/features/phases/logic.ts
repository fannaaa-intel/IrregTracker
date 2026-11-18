// Cycle phases: menstrual, follicular, ovulation, luteal. Pure.
// Honest by design: during a logged period the phase is known. After it, the phase depends on
// when ovulation happens, which can only be estimated for fairly regular cycles (fertility/logic).
// Otherwise the phase is 'unknown' and the app says so instead of guessing.
import { diffDays, type LocalDate } from '../../lib/date';
import type { OpenCycle } from '../cycles/logic';
import { inRange, type FertileStatus } from '../fertility/logic';

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal' | 'unknown';

export const PHASES: readonly Exclude<CyclePhase, 'unknown'>[] = [
  'menstrual',
  'follicular',
  'ovulation',
  'luteal',
];

export type PhaseInfo = {
  phase: CyclePhase;
  /** False only for logged period days; every other phase is an estimate. */
  estimated: boolean;
};

export function cyclePhase(
  today: LocalDate,
  open: OpenCycle | null,
  fertility: FertileStatus,
): PhaseInfo | null {
  if (open === null || diffDays(today, open.start) < 0) return null;
  if (diffDays(open.period.end, today) >= 0) return { phase: 'menstrual', estimated: false };
  if (fertility.state !== 'shown') return { phase: 'unknown', estimated: true };
  const { ovulation } = fertility.estimate;
  if (today < ovulation.start) return { phase: 'follicular', estimated: true };
  if (inRange(today, ovulation)) return { phase: 'ovulation', estimated: true };
  return { phase: 'luteal', estimated: true };
}

export const phaseName: Record<CyclePhase, string> = {
  menstrual: 'Menstrual phase',
  follicular: 'Follicular phase',
  ovulation: 'Ovulation',
  luteal: 'Luteal phase',
  unknown: 'Phase unclear',
};

export const phaseShort: Record<Exclude<CyclePhase, 'unknown'>, string> = {
  menstrual: 'Period',
  follicular: 'Follicular',
  ovulation: 'Ovulation',
  luteal: 'Luteal',
};

/** Plain, factual words for each phase. No promises about how anyone "should" feel. */
export const phaseText: Record<CyclePhase, string> = {
  menstrual:
    'Your period. The lining of the uterus sheds as hormone levels drop. Cramps and tiredness are common.',
  follicular:
    'After your period, until ovulation. Estrogen rises as an egg matures. This is the part of the cycle whose length varies the most.',
  ovulation:
    'An egg is released on one of these days, after a rise in LH. Pregnancy is most likely around now.',
  luteal:
    'After ovulation, until your next period, usually about 12 to 14 days. Progesterone leads; bloating or mood changes can show up near the end.',
  unknown:
    "Your recent cycles vary a lot, so ovulation can't be estimated, and without it the app can't tell which phase you're in. That's common with irregular cycles. If you use ovulation (LH) test strips, logging a positive one shows your phase for this cycle.",
};
