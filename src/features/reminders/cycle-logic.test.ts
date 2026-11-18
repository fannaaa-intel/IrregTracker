import { addDays } from '../../lib/date';
import { regular } from '../__fixtures__/histories';
import { buildOverview } from '../cycles/overview';
import {
  CYCLE_REMINDER_TITLE,
  isCycleReminderId,
  NEUTRAL_BODY,
  normalizeCycleReminders,
  planCycleReminders,
} from './cycle-logic';

const ON = { enabled: true, details: true };
const overviewOn = (today: string) =>
  buildOverview({ days: regular.days, tags: [], confirmed: [] }, today);
const at = (date: string, hour = 8, minute = 0) => ({ date, hour, minute });

function plan(today: string, settings = ON, hour = 8) {
  const { prediction, fertile } = overviewOn(today);
  return planCycleReminders({ prediction, fertile }, settings, at(today, hour), 'en-US');
}

function usualOf(today: string) {
  const { prediction } = overviewOn(today);
  if (prediction.state !== 'window') throw new Error('expected a window');
  return prediction.usual;
}

describe('planCycleReminders', () => {
  const usual = usualOf(regular.lastStart);

  it('plans fertile, heads-up, start check and late check-ins, soonest first', () => {
    expect(plan(regular.lastStart).map((r) => [r.kind, r.date, r.hour])).toEqual([
      ['fertile-soon', addDays(overviewOn(regular.lastStart).fertile!.fertile.start, -1), 9],
      ['period-soon', addDays(usual.start, -2), 9],
      ['period-check', usual.start, 20],
      ['late-check', addDays(usual.end, 1), 9],
      ['late-check', addDays(usual.end, 3), 9],
      ['late-check', addDays(usual.end, 7), 9],
    ]);
  });

  it('says "1 day" late on the first check-in (singular) and gives ranges, not dates', () => {
    const reminders = plan(regular.lastStart);
    expect(reminders.find((r) => r.date === addDays(usual.end, 1))?.body).toMatch(
      /^Your period is 1 day later than the usual range\./,
    );
    expect(reminders.find((r) => r.kind === 'period-soon')?.body).toMatch(/between .+ and .+\./);
  });

  it('keeps the lock screen neutral unless details are on', () => {
    for (const r of plan(regular.lastStart, { enabled: true, details: false })) {
      expect(r.title).toBe(CYCLE_REMINDER_TITLE);
      expect(r.body).toBe(NEUTRAL_BODY);
    }
  });

  it('plans nothing when turned off', () => {
    expect(plan(regular.lastStart, { enabled: false, details: true })).toEqual([]);
  });

  it('only plans what is still ahead: the same-day reminder until its hour (boundary)', () => {
    const day = usual.start;
    const before = planCycleReminders(overviewOn(day), ON, at(day, 19, 59)).map((r) => r.kind);
    const after = planCycleReminders(overviewOn(day), ON, at(day, 20, 0)).map((r) => r.kind);
    expect(before).toContain('period-check');
    expect(after).not.toContain('period-check');
  });

  it('once late, keeps only the remaining check-ins (no heads-up, no fertile)', () => {
    const today = addDays(usual.end, 2);
    expect(plan(today).map((r) => [r.kind, r.date])).toEqual([
      ['late-check', addDays(usual.end, 3)],
      ['late-check', addDays(usual.end, 7)],
    ]);
  });

  it('uses ids it can recognise later for cancelling', () => {
    expect(plan(regular.lastStart).every((r) => isCycleReminderId(r.id))).toBe(true);
    expect(isCycleReminderId('kind-note-2026-11-18')).toBe(false);
  });
});

describe('normalizeCycleReminders', () => {
  it('defaults to on with neutral text', () => {
    expect(normalizeCycleReminders(null)).toEqual({ enabled: true, details: false });
    expect(normalizeCycleReminders({ enabled: false })).toEqual({ enabled: false, details: false });
  });
});
