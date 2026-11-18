import { addDays } from '../../lib/date';
import { irregular, onlyTwoCycles, regular } from '../__fixtures__/histories';
import { predictNextPeriod } from '../prediction/logic';
import { countedCycles, deriveCycles } from './logic';
import { ringModel, summarizeCycles } from './summary';

describe('summarizeCycles', () => {
  it('is null with no counted cycles', () => {
    expect(summarizeCycles([])).toBeNull();
  });

  it('summarizes the counted cycles', () => {
    const { closed } = deriveCycles(irregular.days);
    // irregular: [31, 38, 34, 29, 36, 33, 40, 32], 5-day periods
    expect(summarizeCycles(countedCycles(closed, []))).toEqual({
      count: 8,
      typical: 34, // median 33.5, rounded
      shortest: 29,
      longest: 40,
      variation: 11,
      typicalPeriod: 5,
    });
  });
});

describe('ringModel', () => {
  const history = deriveCycles(regular.days);
  const open = history.open!;
  const at = (day: number) => addDays(regular.lastStart, day - 1);
  const predictionOn = (day: number) => predictNextPeriod(history, [], at(day));

  it('shows the day and the window, scaled to the window end', () => {
    // regular: window = days 26–30 after the start
    expect(ringModel(open, predictionOn(18), at(18), 28)).toEqual({
      day: 18,
      progress: 18 / 30,
      window: { from: 26 / 30, to: 1 },
      usual: { min: 26, max: 30 },
    });
  });

  it('stretches the ring when the period is late, so progress never overflows', () => {
    const model = ringModel(open, predictionOn(40), at(40), 28);
    expect(model?.progress).toBe(1);
    expect(model?.window).toEqual({ from: 26 / 40, to: 30 / 40 });
  });

  it('while learning, uses the typical length if there is one, or no arc at all', () => {
    const learning = deriveCycles(onlyTwoCycles.days);
    const prediction = predictNextPeriod(learning, [], onlyTwoCycles.lastStart);
    expect(ringModel(learning.open!, prediction, onlyTwoCycles.lastStart, 31)).toEqual({
      day: 1,
      progress: 1 / 31,
      window: null,
      usual: null,
    });
    expect(
      ringModel(learning.open!, prediction, onlyTwoCycles.lastStart, null)?.progress,
    ).toBeNull();
  });

  it('is null before the cycle starts', () => {
    expect(ringModel(open, predictionOn(1), addDays(regular.lastStart, -1), 28)).toBeNull();
  });
});
