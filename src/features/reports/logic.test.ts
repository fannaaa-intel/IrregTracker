import { buildHistory } from '../__fixtures__/histories';
import { deriveCycles } from '../cycles/logic';
import { cycleLine, periodLine, reportTitle, sexLine, symptomBarLabel, symptomLine } from './copy';
import { summarizeMonth } from './logic';

// Fixture starts: 2025-01-06, then +28 → 2025-02-03, +30 → 2025-03-05 (open). Periods last 5 days.
const fixture = buildHistory([28, 30]);
const history = deriveCycles(fixture.days);
const FEB_2025 = { year: 2025, month: 2 };
const MARCH_2025 = { year: 2025, month: 3 };

const symptoms = [
  { date: '2025-02-03', type: 'cramps' as const },
  { date: '2025-02-03', type: 'bloating' as const },
  { date: '2025-02-04', type: 'cramps' as const },
  { date: '2025-02-28', type: 'acne' as const }, // last day of February
  { date: '2025-03-01', type: 'cramps' as const }, // first day of March: not counted in Feb
];
const intimacy = [
  { date: '2025-02-10', protection: 'protected' as const },
  { date: '2025-02-14', protection: 'unprotected' as const },
  { date: '2025-03-01', protection: 'protected' as const },
];

describe('summarizeMonth', () => {
  const feb = summarizeMonth(FEB_2025, { days: fixture.days, history, symptoms, intimacy });

  it('finds the period that started this month and the cycle that ended', () => {
    expect(feb.periodStarts).toEqual([{ start: '2025-02-03', length: 5 }]);
    expect(feb.periodDays).toBe(5);
    expect(feb.spottingDays).toBe(0);
    expect(feb.cyclesEnded).toEqual([28]);
  });

  it('counts symptoms per day, most frequent first, within month bounds', () => {
    expect(feb.symptomDays).toBe(3);
    expect(feb.symptoms).toEqual([
      { symptom: 'cramps', days: 2 },
      { symptom: 'bloating', days: 1 },
      { symptom: 'acne', days: 1 },
    ]);
  });

  it('counts sex days with protection', () => {
    expect(feb.sex).toEqual({ days: 2, protected: 1, unprotected: 1 });
    expect(feb.empty).toBe(false);
  });

  it('reports the open cycle start in its month', () => {
    const march = summarizeMonth(MARCH_2025, { days: fixture.days, history, symptoms, intimacy });
    expect(march.periodStarts).toEqual([{ start: '2025-03-05', length: 5 }]);
    expect(march.cyclesEnded).toEqual([30]);
    expect(march.symptoms).toEqual([{ symptom: 'cramps', days: 1 }]);
  });

  it('is empty for a month with nothing logged', () => {
    const empty = summarizeMonth(
      { year: 2026, month: 7 },
      {
        days: fixture.days,
        history,
        symptoms,
        intimacy,
      },
    );
    expect(empty).toMatchObject({ empty: true, periodStarts: [], symptoms: [], cyclesEnded: [] });
  });
});

describe('report copy', () => {
  const feb = summarizeMonth(FEB_2025, { days: fixture.days, history, symptoms, intimacy });
  const empty = summarizeMonth(
    { year: 2026, month: 7 },
    { days: [], history, symptoms: [], intimacy: [] },
  );

  it('reads as plain, calm sentences', () => {
    expect(reportTitle(feb, 'en-US')).toBe('February 2025 at a glance');
    expect(periodLine(feb, 'en-US')).toBe('Started Feb 3 (5 days).');
    expect(cycleLine(feb)).toBe('Cycle length: 28 days.');
    expect(symptomLine(feb)).toBe('Symptoms logged on 3 days.');
    expect(sexLine(feb)).toBe('2 days: 1 protected, 1 unprotected.');
    expect(symptomBarLabel('cramps', 1)).toBe('Cramps, 1 day');
  });

  it('handles an empty month without alarming words', () => {
    expect(periodLine(empty)).toBe('No period started this month.');
    expect(cycleLine(empty)).toBeNull();
    expect(symptomLine(empty)).toBe('No symptoms logged.');
    expect(sexLine(empty)).toBe('No sex logged.');
  });
});
