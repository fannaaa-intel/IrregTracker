import { addDays } from '../../lib/date';
import { regular } from '../__fixtures__/histories';
import { buildOverview } from '../cycles/overview';
import { greetingFor, phaseHint, todayLines } from './logic';

describe('greetingFor', () => {
  it.each([
    [4, 'Hello'],
    [5, 'Good morning'],
    [11, 'Good morning'],
    [12, 'Good afternoon'],
    [17, 'Good afternoon'],
    [18, 'Good evening'],
    [22, 'Good evening'],
    [23, 'Hello'],
    [0, 'Hello'],
  ])('at %i:00 says "%s"', (hour, text) => {
    expect(greetingFor(hour)).toBe(text);
  });
});

describe('todayLines', () => {
  it('is empty when nothing is logged', () => {
    expect(todayLines({ flow: null, symptoms: [], protection: null })).toEqual([]);
  });

  it('lists flow, symptoms and sex in plain words', () => {
    expect(
      todayLines({ flow: 'medium', symptoms: ['cramps', 'bloating'], protection: 'protected' }),
    ).toEqual(['Medium flow', 'Cramps and bloating', 'Sex, protected']);
    expect(todayLines({ flow: 'spotting', symptoms: [], protection: null })).toEqual(['Spotting']);
  });
});

describe('phaseHint', () => {
  const at = (offset: number, fertileOn = true) => {
    const today = addDays(regular.lastStart, offset);
    const o = buildOverview({ days: regular.days, tags: [], confirmed: [] }, today);
    return phaseHint({
      today,
      prediction: o.prediction,
      open: o.history.open,
      fertile: fertileOn ? o.fertile : null,
    });
  };
  // regular: period lasts 5 days (offsets 0–4), fertile cycle days 9–18, ovulation 12–16,
  // usual window offsets 26–30 after the start.

  it('counts period days while bleeding, up to the last logged day', () => {
    expect(at(0)).toEqual({ kind: 'period', text: 'Period day 1' });
    expect(at(4)).toEqual({ kind: 'period', text: 'Period day 5' });
    expect(at(5)?.kind).not.toBe('period');
  });

  it('shows fertile and ovulation days only when fertile days are on', () => {
    expect(at(8)?.kind).toBe('fertile');
    expect(at(10)?.kind).toBe('fertile');
    expect(at(11)?.kind).toBe('ovulation');
    expect(at(15)?.kind).toBe('ovulation');
    expect(at(16)?.kind).toBe('fertile');
    expect(at(11, false)?.kind).not.toBe('ovulation');
  });

  it('gives a range of days before the window, never a single date', () => {
    expect(at(20)).toEqual({ kind: 'soon', text: 'Period likely in 6–10 days' });
    expect(at(26)?.kind).toBe('any-day');
    expect(at(31)?.kind).toBe('late');
  });

  it('shows the plain cycle day when nothing else applies', () => {
    expect(at(5, false)).toEqual({ kind: 'cycle', text: 'Day 6 of your cycle' });
  });
});
