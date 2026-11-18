// Cycle reminders (her feedback + PLAN.md v1.5): local notifications only, planned here (pure: no
// clock, no notifications API) and scheduled by cycle-scheduler.ts. Lock-screen text is neutral
// unless she turns on details (CLAUDE.md §1.6). Never a single predicted date (CLAUDE.md §2.1).
import { addDays, diffDays, format, type LocalDate } from '../../lib/date';
import type { FertileEstimate } from '../fertility/logic';
import type { Prediction } from '../prediction/logic';

export type CycleReminderSettings = { enabled: boolean; details: boolean };
/** On by default (owner request); details off so nothing personal shows on the lock screen. */
export const DEFAULT_CYCLE_REMINDERS: CycleReminderSettings = { enabled: true, details: false };

/** Heads-up this many days before the likely window opens. */
export const HEADS_UP_DAYS = 2;
/** Gentle check-ins this many days past the usual range ("1 day late", then 3 and 7). */
export const LATE_CHECK_DAYS: readonly number[] = [1, 3, 7];
const MORNING = 9;
const EVENING = 20;
const ID_PREFIX = 'cycle-reminder-';

export const CYCLE_REMINDER_TITLE = 'Reminder from Cycle';
export const NEUTRAL_BODY = 'Time for a quick check-in. Tap to open.';

export type CycleReminderKind = 'period-soon' | 'period-check' | 'late-check' | 'fertile-soon';

export type PlannedReminder = {
  id: string;
  kind: CycleReminderKind;
  date: LocalDate;
  hour: number;
  minute: number;
  title: string;
  body: string;
};

type Clock = { date: LocalDate; hour: number; minute: number };

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
const range = (start: LocalDate, end: LocalDate, locale?: string) =>
  `${format(start, { locale })} and ${format(end, { locale })}`;

export function isCycleReminderId(id: string): boolean {
  return id.startsWith(ID_PREFIX);
}

function isAfter(date: LocalDate, hour: number, now: Clock): boolean {
  const days = diffDays(date, now.date);
  return days > 0 || (days === 0 && hour * 60 > now.hour * 60 + now.minute);
}

/**
 * Reminders from now on, soonest first. `fertile` is null when fertile days are off or unknown.
 * Re-planned whenever the app opens or something is logged, so they follow her latest data.
 */
export function planCycleReminders(
  { prediction, fertile }: { prediction: Prediction; fertile: FertileEstimate | null },
  settings: CycleReminderSettings,
  now: Clock,
  locale?: string,
): PlannedReminder[] {
  if (!settings.enabled || prediction.state !== 'window') return [];
  const { usual } = prediction;
  const plan: Omit<PlannedReminder, 'id' | 'title' | 'minute'>[] = [];

  if (prediction.daysLate === 0) {
    plan.push({
      kind: 'period-soon',
      date: addDays(usual.start, -HEADS_UP_DAYS),
      hour: MORNING,
      body: `Your period may start between ${range(usual.start, usual.end, locale)}. It might help to keep supplies with you.`,
    });
    plan.push({
      kind: 'period-check',
      date: usual.start,
      hour: EVENING,
      body: 'Did your period start? Tap to log it, plus anything you feel, like cramps or bloating.',
    });
  }
  for (const days of LATE_CHECK_DAYS) {
    plan.push({
      kind: 'late-check',
      date: addDays(usual.end, days),
      hour: MORNING,
      body: `Your period is ${plural(days, 'day')} later than the usual range. Stress, travel and illness can shift timing. If it started, tap to log the first day.`,
    });
  }
  if (fertile !== null) {
    plan.push({
      kind: 'fertile-soon',
      date: addDays(fertile.fertile.start, -1),
      hour: MORNING,
      body: `Possible fertile days start tomorrow, likely between ${range(fertile.fertile.start, fertile.fertile.end, locale)}. If you're not planning a pregnancy, use protection like condoms.`,
    });
  }

  return plan
    .filter((r) => isAfter(r.date, r.hour, now))
    .sort((a, b) => diffDays(a.date, b.date) || a.hour - b.hour)
    .map((r) => ({
      ...r,
      id: `${ID_PREFIX}${r.kind}-${r.date}`,
      minute: 0,
      title: CYCLE_REMINDER_TITLE,
      body: settings.details ? r.body : NEUTRAL_BODY,
    }));
}

/** Reads stored settings defensively; anything unexpected falls back to the defaults. */
export function normalizeCycleReminders(value: unknown): CycleReminderSettings {
  if (typeof value !== 'object' || value === null) return DEFAULT_CYCLE_REMINDERS;
  const { enabled, details } = value as Record<string, unknown>;
  return {
    enabled: typeof enabled === 'boolean' ? enabled : DEFAULT_CYCLE_REMINDERS.enabled,
    details: typeof details === 'boolean' ? details : DEFAULT_CYCLE_REMINDERS.details,
  };
}
