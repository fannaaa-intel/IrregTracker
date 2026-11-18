import { addDays } from '../../lib/date';
import { steadyCycles } from '../__fixtures__/histories';
import { deriveCycles } from '../cycles/logic';
import type { Symptom } from '../symptoms/logic';
import { PATTERN_WINDOW_DAYS, patternText, symptomPatterns } from './logic';

// Four steady 28-day cycles: five period starts (the last one is the open cycle).
const fixture = steadyCycles(4);
const history = deriveCycles(fixture.days);

/** `type` logged `offset` days from the start of each of the first `count` periods. */
function around(type: Symptom, offset: number, count: number) {
  return fixture.starts.slice(0, count).map((start) => ({ date: addDays(start, offset), type }));
}

describe('symptomPatterns', () => {
  it('needs the symptom around 3 periods (boundary 2 vs 3)', () => {
    expect(symptomPatterns(history, around('cramps', -1, 2))).toEqual([]);
    expect(symptomPatterns(history, around('cramps', -1, 3))).toEqual([
      { symptom: 'cramps', offset: -1, periods: 3 },
    ]);
  });

  it('uses the first day logged around each period, and the median across periods', () => {
    const entries = [
      ...around('bloating', -2, 5),
      ...around('bloating', 0, 5), // later days around the same period don't move the start
      { date: addDays(fixture.starts[4], -4), type: 'bloating' as const },
    ];
    expect(symptomPatterns(history, entries)).toEqual([
      { symptom: 'bloating', offset: -2, periods: 5 },
    ]);
  });

  it('ignores symptoms far from any period start (window boundary)', () => {
    expect(symptomPatterns(history, around('acne', PATTERN_WINDOW_DAYS, 3))).toHaveLength(1);
    expect(symptomPatterns(history, around('acne', PATTERN_WINDOW_DAYS + 1, 3))).toEqual([]);
  });

  it('lists the most consistent patterns first', () => {
    const result = symptomPatterns(history, [
      ...around('headache', 1, 3),
      ...around('cramps', 0, 5),
    ]);
    expect(result.map((p) => p.symptom)).toEqual(['cramps', 'headache']);
  });
});

describe('patternText', () => {
  it('reads as a calm sentence about her own logs', () => {
    expect(patternText({ symptom: 'cramps', offset: -1, periods: 3 })).toBe(
      'Cramps: usually about 1 day before your period starts',
    );
    expect(patternText({ symptom: 'bloating', offset: -3, periods: 3 })).toBe(
      'Bloating: usually about 3 days before your period starts',
    );
    expect(patternText({ symptom: 'back-pain', offset: 0, periods: 3 })).toBe(
      'Back pain: usually on the first day of your period',
    );
    expect(patternText({ symptom: 'tired', offset: 1, periods: 3 })).toBe(
      'Tired: usually around day 2 of your period',
    );
  });
});
