import { addDays } from '../../lib/date';
import {
  buildHistory,
  latestCycleOf,
  latestPeriodOf,
  regular,
  veryIrregular,
  type HistoryFixture,
} from '../__fixtures__/histories';
import { deriveCycles, type CycleTag } from '../cycles/logic';
import { detectFlags } from './logic';

function flagsFor(fixture: HistoryFixture, { tags = [] as CycleTag[], daysAfterStart = 3 } = {}) {
  return detectFlags(deriveCycles(fixture.days), tags, addDays(fixture.lastStart, daysAfterStart));
}

const types = (fixture: HistoryFixture, options?: Parameters<typeof flagsFor>[1]) =>
  flagsFor(fixture, options).map((f) => f.type);

describe('detectFlags', () => {
  it('finds nothing for a regular history', () => {
    expect(flagsFor(regular)).toEqual([]);
  });

  describe('short cycle (≤ 20 days)', () => {
    it('flags 20 days but not 21', () => {
      expect(flagsFor(latestCycleOf(20))).toContainEqual({
        type: 'short-cycle',
        id: `short-cycle:${latestCycleOf(20).starts[5]}`,
        days: 20,
      });
      expect(types(latestCycleOf(21))).not.toContain('short-cycle');
    });

    it('also notes the variation it causes among otherwise steady cycles', () => {
      // 27–29 day cycles then 20: max − min = 9
      expect(types(latestCycleOf(20))).toEqual(['short-cycle', 'high-variation']);
    });

    it('waits while a very short cycle needs confirmation', () => {
      expect(types(latestCycleOf(9))).toEqual([]);
    });
  });

  describe('long cycle (≥ 36 days)', () => {
    it('flags 36 days but not 35', () => {
      expect(flagsFor(latestCycleOf(36))).toContainEqual(
        expect.objectContaining({ type: 'long-cycle', days: 36 }),
      );
      expect(types(latestCycleOf(35))).not.toContain('long-cycle');
    });

    it('still notes a long cycle she tagged, since tags only affect predictions', () => {
      const history = latestCycleOf(40);
      const tags = [{ cycleStart: history.starts[5], exclude: true }];
      expect(types(history, { tags })).toContain('long-cycle');
    });
  });

  describe('long period (≥ 8 days)', () => {
    it('flags 8 days but not 7', () => {
      expect(flagsFor(latestPeriodOf(8))).toMatchObject([{ type: 'long-period', days: 8 }]);
      expect(types(latestPeriodOf(7))).toEqual([]);
    });
  });

  describe('high variation (max − min ≥ 8 over the last 6 counted cycles)', () => {
    it('flags a spread of 8 but not 7', () => {
      expect(flagsFor(buildHistory([28, 36, 28, 28, 28, 28]))).toMatchObject([
        { type: 'high-variation', days: 8 },
      ]);
      expect(types(buildHistory([28, 35, 28, 28, 28, 28]))).toEqual([]);
    });

    it('only looks at the last 6 cycles', () => {
      expect(types(buildHistory([45, 28, 28, 28, 28, 28, 28]))).toEqual([]);
    });

    it('ignores cycles tagged to be excluded', () => {
      const history = buildHistory([28, 36, 28, 28, 28, 28]);
      const tags = [{ cycleStart: history.starts[1], exclude: true }];
      expect(types(history, { tags })).toEqual([]);
    });

    it('needs at least 3 counted cycles', () => {
      expect(types(buildHistory([38, 28]))).toEqual([]);
    });
  });

  describe('no period for 90 days', () => {
    it('flags at 90 days since the last start but not 89', () => {
      expect(flagsFor(regular, { daysAfterStart: 90 })).toEqual([
        { type: 'no-period', id: `no-period:${regular.lastStart}`, days: 90 },
      ]);
      expect(types(regular, { daysAfterStart: 89 })).toEqual([]);
    });
  });

  it('lists flags most important first', () => {
    expect(types(latestPeriodOf(9), { daysAfterStart: 120 })).toEqual(['no-period', 'long-period']);
    expect(types(veryIrregular)).toEqual(['long-cycle', 'high-variation']);
  });
});
