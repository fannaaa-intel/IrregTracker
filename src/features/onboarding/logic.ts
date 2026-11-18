// The welcome cards (PLAN.md §7, plus a card for her feedback round 1). Pure: content and the "show it?" rule.
import { MIN_CYCLES_FOR_PREDICTION } from '../flags/thresholds';

export type OnboardingCard = {
  key: 'welcome' | 'track' | 'privacy' | 'backfill';
  title: string;
  body: string;
  note?: string;
};

export const ONBOARDING_CARDS: readonly OnboardingCard[] = [
  {
    key: 'welcome',
    title: 'A calm place for your cycle',
    body: 'Log a period day with one tap. The app learns from your own cycles and shows a likely window, never a single date. Irregular cycles are welcome here.',
    note: 'Not a medical device and not contraception.',
  },
  {
    key: 'track',
    title: 'Notice how you feel',
    body: 'Log cramps, bloating and other symptoms with a tap, and mark sex with a heart. See possible fertile days, a monthly summary and gentle reminders.',
    note: 'Fertile days are rough estimates from your own cycles, never contraception.',
  },
  {
    key: 'privacy',
    title: 'Private by design',
    body: 'Everything you log stays on this phone, encrypted. No account, no ads, no tracking.',
    note: 'The app only goes online to download app updates. It never sends your data.',
  },
  {
    key: 'backfill',
    title: 'Add your last few periods',
    body: `Predictions start once ${MIN_CYCLES_FOR_PREDICTION} cycles are logged. Adding past periods from memory or old notes gets you there sooner.`,
    note: 'Rough dates are fine. You can add or change them any time from the calendar.',
  },
];

/**
 * Show the welcome only on a fresh start: not after she finished or skipped it, and not when
 * days are already logged (for example after restoring a backup).
 */
export function needsOnboarding(done: boolean, loggedDayCount: number): boolean {
  return !done && loggedDayCount === 0;
}
