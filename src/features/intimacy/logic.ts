// Sex log (her feedback), shown with a heart on the calendar. Pure.
// Wording is calm, gender-neutral and doesn't assume a partner or pregnancy goals (CLAUDE.md §2.7).
// The safer-sex lines come from CDC and ACOG (docs/HEALTH_RULES.md → "Safer sex wording").
import { inRange, type DayRange } from '../fertility/logic';

export type Protection = 'protected' | 'unprotected';
export const PROTECTIONS: readonly Protection[] = ['protected', 'unprotected'];

export const protectionLabel: Record<Protection, string> = {
  protected: 'Protected',
  unprotected: 'Unprotected',
};

export function isProtection(value: string): value is Protection {
  return (PROTECTIONS as readonly string[]).includes(value);
}

export const SAFER_SEX_TIP =
  'Condoms are the only method that lowers the chance of both pregnancy and STIs. They work best used every time, from start to finish.';

export const EMERGENCY_TIP =
  "If pregnancy isn't the plan, emergency contraception can work up to 5 days after sex and works best the sooner it's taken. A pharmacist or doctor can help.";

export const FERTILE_DAY_NOTE = 'This day falls in your possible fertile days.';

/** The calm notes to show after logging sex on `date`, most important first. */
export function saferSexNotes(
  date: string,
  protection: Protection,
  fertile: DayRange | null,
): string[] {
  const notes: string[] = [];
  if (protection === 'unprotected') {
    if (inRange(date, fertile)) notes.push(FERTILE_DAY_NOTE);
    notes.push(EMERGENCY_TIP);
  }
  notes.push(SAFER_SEX_TIP);
  return notes;
}
