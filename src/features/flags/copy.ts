// Wording for flag cards and the "Why am I seeing this?" screen (docs/HEALTH_RULES.md).
// Calm notes, never alerts or diagnoses (CLAUDE.md §2.3–2.4). Numbers come from thresholds.ts.
import { VARIATION_WINDOW, type FlagType, type HealthFlag } from './logic';
import {
  LONG_CYCLE_FLAG,
  LONG_PERIOD_FLAG,
  NO_PERIOD_DAYS,
  NORMAL_CYCLE_MAX,
  NORMAL_CYCLE_MIN,
  SHORT_CYCLE_FLAG,
  VARIATION_FLAG,
} from './thresholds';

export const FLAG_TYPES: readonly FlagType[] = [
  'no-period',
  'long-period',
  'short-cycle',
  'long-cycle',
  'high-variation',
];

export function isFlagType(value: string): value is FlagType {
  return (FLAG_TYPES as readonly string[]).includes(value);
}

export const flagTitle: Record<FlagType, string> = {
  'short-cycle': 'A shorter cycle',
  'long-cycle': 'A longer cycle',
  'long-period': 'A longer period',
  'high-variation': 'Your cycles have varied',
  'no-period': "It's been a while",
};

/** Card text, word for word from the HEALTH_RULES.md templates. */
export function flagMessage({ type, days }: HealthFlag): string {
  switch (type) {
    case 'short-cycle':
      return `This cycle was shorter than usual (${days} days). One-off changes are common. If it keeps happening, it can be worth mentioning to a doctor.`;
    case 'long-cycle':
      return `This cycle was longer than usual (${days} days). Stress, travel, and illness can all shift timing. If it keeps happening, it can be worth mentioning to a doctor.`;
    case 'long-period':
      return `This period lasted ${days} days. If periods often last ${LONG_PERIOD_FLAG} days or more, it can be worth mentioning to a doctor.`;
    case 'high-variation':
      return `Your cycle lengths have varied by ${days} days recently. That's why your prediction window is wider. A doctor can help if you'd like to understand why.`;
    case 'no-period':
      return `It's been ${days} days since your last logged period. If you're not pregnant and this is new for you, it's a good idea to check in with a doctor.`;
  }
}

export type FlagExplanation = {
  title: string;
  /** What the app looked at to show this note. */
  why: string;
  /** Common, non-medical context. */
  context: string;
  /** When talking to a doctor can help. */
  next: string;
};

const TYPICAL_RANGE = `Adult cycles typically last ${NORMAL_CYCLE_MIN} to ${NORMAL_CYCLE_MAX} days.`;
const TIMING_CONTEXT =
  'A single cycle outside that range is common. Stress, illness, travel, and changes in sleep, weight, or exercise can all shift timing.';

export const flagExplanation: Record<FlagType, FlagExplanation> = {
  'short-cycle': {
    title: 'About shorter cycles',
    why: `This note appears when a cycle lasts ${SHORT_CYCLE_FLAG} days or fewer. ${TYPICAL_RANGE}`,
    context: TIMING_CONTEXT,
    next: 'If short cycles keep happening, it can be worth mentioning to a doctor.',
  },
  'long-cycle': {
    title: 'About longer cycles',
    why: `This note appears when a cycle lasts ${LONG_CYCLE_FLAG} days or more. ${TYPICAL_RANGE}`,
    context: TIMING_CONTEXT,
    next: 'If long cycles keep happening, it can be worth mentioning to a doctor.',
  },
  'long-period': {
    title: 'About longer periods',
    why: `This note appears when a period lasts ${LONG_PERIOD_FLAG} days or more, which is longer than most periods.`,
    context:
      'One longer period now and then can happen. Logging a few extra spotting days at the end can also make a period look longer.',
    next: `If periods often last ${LONG_PERIOD_FLAG} days or more, it can be worth mentioning to a doctor.`,
  },
  'high-variation': {
    title: 'About cycles that vary',
    why: `This note appears when your last ${VARIATION_WINDOW} counted cycles differ by ${VARIATION_FLAG} days or more from shortest to longest. Cycles you tagged and left out are not counted.`,
    context:
      'Some variation is normal, and it is common with irregular cycles. When lengths vary more, the app shows a wider window so the estimate stays honest.',
    next: "A doctor can help if you'd like to understand why your cycles vary.",
  },
  'no-period': {
    title: 'About a long gap',
    why: `This note appears when ${NO_PERIOD_DAYS} days or more have passed since your last logged period started.`,
    context:
      "Periods can pause for many reasons, such as stress, big changes in weight or exercise, some medicines, or pregnancy. It's also possible a period wasn't logged.",
    next: "If you're not pregnant and this is new for you, it's a good idea to check in with a doctor.",
  },
};

export const FLAG_DISCLAIMER =
  "These notes only look at the dates you've logged. They can't diagnose anything and aren't medical advice. The ranges come from NICHD and ACOG guidance.";
