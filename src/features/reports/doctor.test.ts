import { addDays } from '../../lib/date';
import { buildHistory, steadyCycles } from '../__fixtures__/histories';
import { buildOverview } from '../cycles/overview';
import { buildDoctorSummary, SUMMARY_MAX_CYCLES, SUMMARY_RECENT_DAYS } from './doctor';

function summaryOf(fixture: ReturnType<typeof buildHistory>, today: string, extra = {}) {
  const overview = buildOverview({ days: fixture.days, tags: [], confirmed: [] }, today);
  return buildDoctorSummary({
    overview,
    firstLogged: fixture.days[0].date,
    symptoms: [],
    notes: [],
    today,
    ...extra,
  });
}

describe('buildDoctorSummary', () => {
  const fixture = buildHistory([29, 31, 45, 28]);
  const today = addDays(fixture.lastStart, 10);

  it('lists recent cycles newest first, with the current cycle day', () => {
    const s = summaryOf(fixture, today);
    expect(s.cycles.map((c) => c.length)).toEqual([28, 45, 31, 29]);
    expect(s.current).toEqual({ start: fixture.lastStart, day: 11 });
    expect(s.from).toBe(fixture.days[0].date);
  });

  it('caps the cycle list at 12', () => {
    const long = steadyCycles(SUMMARY_MAX_CYCLES + 3);
    expect(summaryOf(long, long.lastStart).cycles).toHaveLength(SUMMARY_MAX_CYCLES);
  });

  it('includes the gentle notes the app shows (e.g. a long cycle)', () => {
    const longLast = buildHistory([28, 29, 28, 40]);
    const s = summaryOf(longLast, longLast.lastStart);
    expect(s.flags.map((f) => f.type)).toContain('long-cycle');
  });

  it('keeps symptoms and notes from the last 90 days only (boundary)', () => {
    const first = addDays(today, -(SUMMARY_RECENT_DAYS - 1));
    const tooOld = addDays(first, -1);
    const s = summaryOf(fixture, today, {
      symptoms: [
        { date: first, type: 'cramps' },
        { date: today, type: 'cramps' },
        { date: tooOld, type: 'acne' },
      ],
      notes: [
        { date: tooOld, body: 'Old made-up note.' },
        { date: first, body: 'First made-up note.' },
        { date: today, body: 'Newest made-up note.' },
      ],
    });
    expect(s.recentSymptoms).toEqual([{ symptom: 'cramps', days: 2 }]);
    expect(s.notes.map((n) => n.body)).toEqual(['Newest made-up note.', 'First made-up note.']);
  });
});
