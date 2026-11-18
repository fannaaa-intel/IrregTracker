// Words for predictions (CLAUDE.md §2.1): always a window, "likely between", never "due".
import { format } from '../../lib/date';
import type { Confidence, Prediction } from './logic';

type WindowPrediction = Extract<Prediction, { state: 'window' }>;
type LearningPrediction = Extract<Prediction, { state: 'learning' }>;

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

export function windowText({ window }: WindowPrediction, locale?: string): string {
  return `Likely between ${format(window.start, { locale })} and ${format(window.end, { locale })}`;
}

/** PLAN.md §6 wording; null when not late. */
export function lateText({ daysLate }: WindowPrediction): string | null {
  if (daysLate <= 0) return null;
  return `Your period is ${plural(daysLate, 'day')} later than the usual range`;
}

export function learningText({ cyclesNeeded }: LearningPrediction): string {
  return `Still learning your cycle. ${plural(cyclesNeeded, 'more complete cycle')} until a likely window can be shown.`;
}

export const confidenceLabel: Record<Confidence, string> = {
  low: 'Low confidence',
  medium: 'Medium confidence',
  high: 'High confidence',
};

/** Filled dots on the ConfidenceChip, so confidence isn't shown by color alone. */
export const confidenceDots: Record<Confidence, 1 | 2 | 3> = { low: 1, medium: 2, high: 3 };
