import { addDays } from '../../lib/date';
import { irregular, regular, steadyCycles, type HistoryFixture } from '../__fixtures__/histories';
import { deriveCycles } from '../cycles/logic';
import { predictNextPeriod } from '../prediction/logic';
import { basisText } from './copy';
import { fertileStatus } from './logic';

describe('a positive ovulation (LH) test', () => {
  const statusWith = (
    fixture: HistoryFixture,
    tests: { date: string; result: 'positive' | 'negative' }[],
    offset = 20,
  ) => {
    const history = deriveCycles(fixture.days);
    const today = addDays(fixture.lastStart, offset);
    return fertileStatus(history, [], predictNextPeriod(history, [], today), tests);
  };

  it('replaces "irregular" with ranges around the test: ovulation P to P+2, fertile P−5 to P+2', () => {
    const p = addDays(irregular.lastStart, 17);
    const status = statusWith(irregular, [{ date: p, result: 'positive' }]);
    if (status.state !== 'shown') throw new Error('expected an estimate');
    expect(status.estimate.ovulation).toEqual({ start: p, end: addDays(p, 2) });
    expect(status.estimate.fertile).toEqual({ start: addDays(p, -5), end: addDays(p, 2) });
    expect(status.estimate).toMatchObject({ source: 'test', testDate: p });
  });

  it('also works when the period is late, and uses the first positive of the cycle', () => {
    const first = addDays(regular.lastStart, 14);
    const status = statusWith(
      regular,
      [
        { date: addDays(first, 1), result: 'positive' },
        { date: first, result: 'positive' },
      ],
      40,
    );
    expect(status.state === 'shown' && status.estimate.testDate).toBe(first);
  });

  it('ignores negative tests and tests from before this period ended (boundary)', () => {
    const periodEnd = addDays(irregular.lastStart, 4);
    expect(statusWith(irregular, [{ date: addDays(periodEnd, 3), result: 'negative' }]).state).toBe(
      'irregular',
    );
    expect(statusWith(irregular, [{ date: periodEnd, result: 'positive' }]).state).toBe(
      'irregular',
    );
    expect(statusWith(irregular, [{ date: addDays(periodEnd, 1), result: 'positive' }]).state).toBe(
      'shown',
    );
  });

  it('never starts fertile days before day 1 of the cycle', () => {
    const fixture = steadyCycles(3, 15);
    const p = addDays(fixture.lastStart, 5);
    const status = statusWith(fixture, [{ date: p, result: 'positive' }], 6);
    expect(status.state === 'shown' && status.estimate.fertile.start).toBe(fixture.lastStart);
  });

  it('says where the estimate came from', () => {
    const p = addDays(irregular.lastStart, 17);
    const status = statusWith(irregular, [{ date: p, result: 'positive' }]);
    if (status.state !== 'shown') throw new Error('expected an estimate');
    expect(basisText(status.estimate)).toMatch(/^From your positive ovulation test on /);
  });
});
