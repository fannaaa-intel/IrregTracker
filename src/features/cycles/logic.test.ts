import { addDays } from '../../lib/date';
import {
  buildHistory,
  lotsOfSpotting,
  oneLongGap,
  onlyTwoCycles,
  regular,
  twoDaysWithGap,
} from '../__fixtures__/histories';
import { countedCycles, cycleDay, deriveCycles, derivePeriods } from './logic';

const oldestFirst = (lengths: number[]) => [...lengths].reverse();

describe('deriveCycles', () => {
  it('returns nothing for an empty history', () => {
    expect(deriveCycles([])).toEqual({ closed: [], open: null });
  });

  it('derives closed cycles newest first and the open current cycle', () => {
    const history = deriveCycles(regular.days);

    expect(history.closed.map((c) => c.length)).toEqual(oldestFirst(regular.cycleLengths));
    expect(history.closed[0].nextStart).toBe(regular.lastStart);
    expect(history.open).toEqual({
      start: regular.lastStart,
      period: { start: regular.lastStart, end: addDays(regular.lastStart, 4), length: 5 },
    });
  });

  it('does not depend on the order days are given in', () => {
    const shuffled = [...regular.days].reverse();
    expect(deriveCycles(shuffled)).toEqual(deriveCycles(regular.days));
  });

  it('keeps a very long cycle as a single cycle', () => {
    const lengths = deriveCycles(oneLongGap.days).closed.map((c) => c.length);
    expect(lengths).toEqual(oldestFirst(oneLongGap.cycleLengths));
  });

  it('works with only one closed cycle or none', () => {
    expect(deriveCycles(buildHistory([]).days).closed).toEqual([]);
    expect(deriveCycles(onlyTwoCycles.days).closed).toHaveLength(2);
  });
});

describe('period merging (PERIOD_MERGE_GAP = 2)', () => {
  it('merges two logged days with 2 unlogged days between them', () => {
    expect(derivePeriods(twoDaysWithGap(2))).toEqual([
      { start: '2026-03-01', end: '2026-03-04', length: 4 },
    ]);
  });

  it('splits them into two periods with 3 unlogged days between', () => {
    expect(derivePeriods(twoDaysWithGap(3)).map((p) => p.start)).toEqual([
      '2026-03-01',
      '2026-03-05',
    ]);
  });
});

describe('spotting', () => {
  it('spotting-only days never start a cycle', () => {
    const lengths = deriveCycles(lotsOfSpotting.days).closed.map((c) => c.length);
    expect(lengths).toEqual(oldestFirst(lotsOfSpotting.cycleLengths));
  });

  it('spotting just before a period does not move day 1', () => {
    const { open } = deriveCycles(lotsOfSpotting.days);
    expect(open?.start).toBe(lotsOfSpotting.lastStart);
    expect(open?.period.length).toBe(5);
  });
});

describe('implausibly short cycles (IMPLAUSIBLE_CYCLE = 10)', () => {
  it('flags a 9-day cycle for confirmation but not a 10-day one', () => {
    const [nine] = deriveCycles(buildHistory([9]).days).closed;
    const [ten] = deriveCycles(buildHistory([10]).days).closed;
    expect(nine.needsConfirmation).toBe(true);
    expect(ten.needsConfirmation).toBe(false);
  });

  it('counts a short cycle once it has been confirmed', () => {
    const history = buildHistory([9]);
    const [cycle] = deriveCycles(history.days, {
      confirmedShortCycles: [history.starts[0]],
    }).closed;
    expect(cycle.needsConfirmation).toBe(false);
  });
});

describe('countedCycles', () => {
  it('leaves out excluded and unconfirmed cycles', () => {
    const history = buildHistory([28, 9, 30, 29]);
    const { closed } = deriveCycles(history.days);
    const tags = [
      { cycleStart: history.starts[2], exclude: true },
      { cycleStart: history.starts[3], exclude: false },
    ];
    expect(countedCycles(closed, tags).map((c) => c.length)).toEqual([29, 28]);
  });
});

describe('cycleDay', () => {
  const { open } = deriveCycles(regular.days);

  it('is 1 on the period start and counts up from there', () => {
    expect(cycleDay(open, regular.lastStart)).toBe(1);
    expect(cycleDay(open, addDays(regular.lastStart, 17))).toBe(18);
  });

  it('is null before the start or with no open cycle', () => {
    expect(cycleDay(open, addDays(regular.lastStart, -1))).toBeNull();
    expect(cycleDay(null, regular.lastStart)).toBeNull();
  });
});
