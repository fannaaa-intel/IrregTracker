import { addDays, diffDays } from '../../lib/date';
import {
  buildHistory,
  irregular,
  onlyTwoCycles,
  regular,
  steadyCycles,
  type HistoryFixture,
} from '../__fixtures__/histories';
import { deriveCycles, type CycleTag } from '../cycles/logic';
import { predictNextPeriod } from '../prediction/logic';
import {
  basisText,
  fertileText,
  irregularText,
  MEDS_NOTE,
  NOT_CONTRACEPTION,
  ovulationText,
} from './copy';
import { estimateFertileDays, fertileStatus, inRange, type DayRange } from './logic';

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
  it('uses shortest − 18 to longest − 11, and typical − 16 to − 12 for ovulation', () => {
    // regular, last 6 cycles: 29 28 27 28 29 28 → shortest 27, longest 29, typical 28
    const result = estimate(regular);
    expect(cycleDays(regular, result?.fertile)).toEqual([9, 18]);
    expect(cycleDays(regular, result?.ovulation)).toEqual([12, 16]);
    expect(result).toMatchObject({ cyclesUsed: 6, rough: false });
  });

  it('keeps ovulation to 5 days inside the fertile days, never a single day', () => {
    for (const fixture of [regular, steadyCycles(3, 21), steadyCycles(3, 35), steadyCycles(6)]) {
      const result = estimate(fixture);
      if (result === null) throw new Error('expected an estimate');
      expect(result.ovulation.start >= result.fertile.start).toBe(true);
      expect(result.ovulation.end <= result.fertile.end).toBe(true);
      const [from, to] = cycleDays(fixture, result.ovulation);
      expect(to - from + 1).toBe(5);
    }
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

describe('fertileStatus', () => {
  const status = (fixture: HistoryFixture, today = fixture.lastStart) => {
    const history = deriveCycles(fixture.days);
    return fertileStatus(history, [], predictNextPeriod(history, [], today));
  };

  it('shows nothing for irregular cycles instead of marking most of the month', () => {
    // irregular, last 6: 32 40 33 36 29 34 → they vary by 11 days
    expect(status(irregular)).toEqual({ state: 'irregular', variation: 11 });
    expect(estimate(irregular)).toBeNull();
  });

  it("draws the line at the app's irregular threshold (7 vs 8 days)", () => {
    expect(status(buildHistory([28, 28, 28, 28, 28, 35])).state).toBe('shown');
    expect(status(buildHistory([28, 28, 28, 28, 28, 36]))).toEqual({
      state: 'irregular',
      variation: 8,
    });
  });

  it('says learning or late when there is no basis', () => {
    expect(status(onlyTwoCycles).state).toBe('learning');
    const history = deriveCycles(regular.days);
    const prediction = predictNextPeriod(history, [], regular.lastStart);
    if (prediction.state !== 'window') throw new Error('expected a window');
    expect(status(regular, addDays(prediction.usual.end, 1)).state).toBe('late');
  });
});

describe('fertile copy', () => {
  const result = estimate(steadyCycles(5));
  if (result === null) throw new Error('expected an estimate');

  it('gives ranges, never a single day', () => {
    expect(fertileText(result, 'en-US')).toMatch(/^Likely between .+ and .+$/);
    expect(ovulationText(result, 'en-US')).toMatch(
      /^Ovulation happens on one day, most likely between .+ and .+$/,
    );
  });

  it('says when it is rough, and always that it is not contraception', () => {
    expect(basisText(result)).toBe('A rough estimate from your last 5 cycles.');
    expect(NOT_CONTRACEPTION).toContain("isn't a form of contraception");
    expect(NOT_CONTRACEPTION).not.toContain('!');
    expect(MEDS_NOTE).toContain('hormonal birth control');
  });

  it('explains irregular cycles calmly, without diagnosing', () => {
    const text = irregularText(11);
    expect(text).toContain('vary by 11 days');
    expect(text).not.toMatch(/!|PCOS|disorder|problem/i);
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
