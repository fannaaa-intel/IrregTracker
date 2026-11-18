// Words for fertile-day estimates. Calm and neutral: no assumption that she wants (or doesn't
// want) a pregnancy, or that she has a partner (CLAUDE.md §2.7). Always says it isn't contraception.
import { format } from '../../lib/date';
import type { DayRange, FertileEstimate } from './logic';

const between = ({ start, end }: DayRange, locale?: string) =>
  `${format(start, { locale })} and ${format(end, { locale })}`;

export function fertileText({ fertile }: FertileEstimate, locale?: string): string {
  return `Likely between ${between(fertile, locale)}`;
}

export function ovulationText({ ovulation }: FertileEstimate, locale?: string): string {
  return `Ovulation likely between ${between(ovulation, locale)}`;
}

export function basisText({ cyclesUsed, rough }: FertileEstimate): string {
  const cycles = `your last ${cyclesUsed} cycles`;
  return rough ? `A rough estimate from ${cycles}.` : `An estimate from ${cycles}.`;
}

export const NOT_CONTRACEPTION =
  "This isn't a form of contraception. Cycles can shift, so if you're not planning a pregnancy, use protection like condoms every time.";

export const FERTILE_PAUSED =
  'Fertile-day estimates come back once your next period is logged, because this cycle is running longer than your usual range.';

export const FERTILE_LEARNING = 'Fertile-day estimates appear once 3 complete cycles are logged.';
