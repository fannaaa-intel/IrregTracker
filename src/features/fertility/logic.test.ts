import { addDays, diffDays } from '../../lib/date';
import {
  irregular,
  onlyTwoCycles,
  regular,
  steadyCycles,
  type HistoryFixture,
} from '../__fixtures__/histories';
import { deriveCycles, type CycleTag } from '../cycles/logic';
import { predictNextPeriod } from '../prediction/logic';
import { basisText, fertileText, NOT_CONTRACEPTION, ovulationText } from './copy';
import { estimateFertileDays, inRange, type DayRange } from './logic';

function estimate(fixture: HistoryFixture, today = fixture.lastStart, tags: CycleTag[] = []) {
  const history = deriveCycles(fixture.days);
  return estimateFertileDays(history, tags, predictNextPeriod(history, tags, today));
}

/** A range as cycle days (day 1 = the period start), e.g. [9, 18]. */
function cycleDays(fixture: HistoryFixture, range: DayRange | undefined): [number, number] {
  if (range === undefined) throw new Error('expected an estimate');
  return [diffDays(range.start, fixture.lastStart) + 1, diffDays(range.end, fixture.lastStart) + 1];
}

describe('estimateFertileDays', () => {
  it('uses shortest − 18 to longest − 11 of the last 6 cycles (calendar method)', () => {
    // regular, last 6 cycles: 29 28 27 28 29 28 → shortest 27, longest 29
    const result = estimate(regular);
    expect(cycleDays(regular, result?.fertile)).toEqual([9, 18]);
    expect(cycleDays(regular, result?.ovulation)).toEqual([11, 17]);
    expect(result).toMatchObject({ cyclesUsed: 6, rough: false });
  });

  it('widens with irregular cycles instead of pretending to be precise', () => {
    // irregular, last 6: 32 40 33 36 29 34 → shortest 29, longest 40
    const result = estimate(irregular);
    expect(cycleDays(irregular, result?.fertile)).toEqual([11, 29]);
    expect(cycleDays(irregular, result?.ovulation)).toEqual([13, 28]);
  });

  it('keeps ovulation inside the fertile days', () => {
    for (const fixture of [regular, irregular, steadyCycles(3, 21), steadyCycles(3, 35)]) {
      const result = estimate(fixture);
      if (result === null) throw new Error('expected an estimate');
      expect(result.ovulation.start >= result.fertile.start).toBe(true);
      expect(result.ovulation.end <= result.fertile.end).toBe(true);
    }
  });

  it('is never a single day, even with identical cycles', () => {
    const fixture = steadyCycles(6, 28);
    expect(cycleDays(fixture, estimate(fixture)?.ovulation)).toEqual([12, 16]);
  });

  it('needs 3 counted cycles: none with 2', () => {
    expect(estimate(onlyTwoCycles)).toBeNull();
    expect(estimate(steadyCycles(3))).not.toBeNull();
  });

  it('is rough below 6 cycles and not at 6', () => {
    expect(estimate(steadyCycles(5))).toMatchObject({ rough: true, cyclesUsed: 5 });
    expect(estimate(steadyCycles(6))).toMatchObject({ rough: false, cyclesUsed: 6 });
  });

  it('leaves out excluded cycles', () => {
    const fixture = steadyCycles(3);
    const tags = [{ cycleStart: fixture.starts[0], exclude: true }];
    expect(estimate(fixture, fixture.lastStart, tags)).toBeNull();
  });

  it('is shown on the last usual day and hidden once the period is late', () => {
    const history = deriveCycles(regular.days);
    const prediction = predictNextPeriod(history, [], regular.lastStart);
    if (prediction.state !== 'window') throw new Error('expected a window');
    expect(estimate(regular, prediction.usual.end)).not.toBeNull();
    expect(estimate(regular, addDays(prediction.usual.end, 1))).toBeNull();
  });

  it('clamps to day 1 for very short cycles', () => {
    const fixture = steadyCycles(3, 15);
    expect(cycleDays(fixture, estimate(fixture)?.fertile)[0]).toBe(1);
  });
});

describe('fertile copy', () => {
  const result = estimate(steadyCycles(5));
  if (result === null) throw new Error('expected an estimate');

  it('gives ranges, never a single day', () => {
    expect(fertileText(result, 'en-US')).toMatch(/^Likely between .+ and .+$/);
    expect(ovulationText(result, 'en-US')).toMatch(/^Ovulation likely between .+ and .+$/);
  });

  it('says when it is rough, and always that it is not contraception', () => {
    expect(basisText(result)).toBe('A rough estimate from your last 5 cycles.');
    expect(NOT_CONTRACEPTION).toContain("isn't a form of contraception");
    expect(NOT_CONTRACEPTION).not.toContain('!');
  });
});

describe('inRange', () => {
  const range = { start: '2026-11-03', end: '2026-11-05' };
  it('includes both ends', () => {
    expect(inRange('2026-11-02', range)).toBe(false);
    expect(inRange('2026-11-03', range)).toBe(true);
    expect(inRange('2026-11-05', range)).toBe(true);
    expect(inRange('2026-11-06', range)).toBe(false);
    expect(inRange('2026-11-04', null)).toBe(false);
  });
});
