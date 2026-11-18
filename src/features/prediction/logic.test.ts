import { addDays, diffDays } from '../../lib/date';
import {
  buildHistory,
  irregular,
  onlyTwoCycles,
  regular,
  steadyCycles,
  veryIrregular,
  type HistoryFixture,
} from '../__fixtures__/histories';
import { deriveCycles, type CycleTag } from '../cycles/logic';
import { predictNextPeriod, type Prediction } from './logic';

function predict(fixture: HistoryFixture, tags: CycleTag[] = [], today = fixture.lastStart) {
  return predictNextPeriod(deriveCycles(fixture.days), tags, today);
}

function windowOf(prediction: Prediction) {
  if (prediction.state !== 'window') throw new Error('expected a window');
  return prediction;
}

/** Window as day offsets from the last period start, e.g. [26, 30]. */
function offsets(fixture: HistoryFixture, prediction: Prediction): [number, number] {
  const { window } = windowOf(prediction);
  return [diffDays(window.start, fixture.lastStart), diffDays(window.end, fixture.lastStart)];
}

describe('still learning', () => {
  it('shows "learning" with no data', () => {
    expect(predictNextPeriod(deriveCycles([]), [], '2026-03-01')).toEqual({
      state: 'learning',
      cyclesCounted: 0,
      cyclesNeeded: 3,
    });
  });

  it('shows "learning" with only 2 complete cycles', () => {
    expect(predict(onlyTwoCycles)).toEqual({
      state: 'learning',
      cyclesCounted: 2,
      cyclesNeeded: 1,
    });
  });

  it('does not count excluded cycles toward the 3 needed', () => {
    const history = steadyCycles(3);
    const tags = [{ cycleStart: history.starts[0], exclude: true }];
    expect(predict(history, tags)).toMatchObject({ state: 'learning', cyclesCounted: 2 });
  });
});

describe('window', () => {
  it('uses half the range (at least 3 days) with exactly 3 cycles', () => {
    expect(offsets(steadyCycles(3), predict(steadyCycles(3)))).toEqual([25, 31]);
    const spread = buildHistory([26, 30, 34]); // median 30, range 8 -> ±4
    expect(offsets(spread, predict(spread))).toEqual([26, 34]);
  });

  it('uses half the IQR (at least 2 days) from 4 cycles on', () => {
    // regular: median 28, IQR 0.5 -> ±2
    expect(offsets(regular, predict(regular))).toEqual([26, 30]);
    // irregular: median 33.5, IQR 4.75 -> ±3, rounded outward
    expect(offsets(irregular, predict(irregular))).toEqual([30, 37]);
    // very irregular: median 35, IQR 14.75 -> ±8
    expect(offsets(veryIrregular, predict(veryIrregular))).toEqual([27, 43]);
  });

  it('uses only the last 12 counted cycles', () => {
    const history = buildHistory([60, 60, ...Array.from({ length: 12 }, () => 28)]);
    expect(predict(history)).toMatchObject({ cyclesCounted: 12, confidence: 'high' });
    expect(offsets(history, predict(history))).toEqual([26, 30]);
  });
});

describe('confidence', () => {
  it.each([
    ['regular', regular, 'high'],
    ['irregular', irregular, 'medium'],
    ['very irregular', veryIrregular, 'low'],
  ])('%s history is %s', (_name, fixture, confidence) => {
    expect(predict(fixture)).toMatchObject({ confidence });
  });

  it('needs at least 6 cycles for high and 4 for medium', () => {
    expect(predict(steadyCycles(6))).toMatchObject({ confidence: 'high' });
    expect(predict(steadyCycles(5))).toMatchObject({ confidence: 'medium' });
    expect(predict(steadyCycles(4))).toMatchObject({ confidence: 'medium' });
    expect(predict(steadyCycles(3))).toMatchObject({ confidence: 'low' });
  });

  it('is high at stdev exactly 3 and medium just above', () => {
    // Deviations ±3 around 28 (sample stdev exactly 3 with the extra 28; ~3.29 without).
    expect(predict(buildHistory([31, 25, 31, 25, 31, 25, 28]))).toMatchObject({
      confidence: 'high',
    });
    expect(predict(buildHistory([31, 25, 31, 25, 31, 25]))).toMatchObject({
      confidence: 'medium',
    });
  });

  it('is medium at stdev exactly 7 and low above', () => {
    expect(predict(buildHistory([35, 21, 35, 21, 28]))).toMatchObject({ confidence: 'medium' });
    expect(predict(buildHistory([36, 20, 36, 20, 28]))).toMatchObject({ confidence: 'low' });
  });
});

describe('late', () => {
  const end = windowOf(predict(regular)).window.end;

  it('is not late on the last day of the window', () => {
    expect(predict(regular, [], end)).toMatchObject({ daysLate: 0 });
  });

  it('counts the days past the window', () => {
    expect(predict(regular, [], addDays(end, 1))).toMatchObject({ daysLate: 1 });
    expect(predict(regular, [], addDays(end, 9))).toMatchObject({ daysLate: 9 });
  });

  it('keeps the usual window on the last day, with its own confidence', () => {
    const onTime = windowOf(predict(regular, [], end));
    expect(onTime.window).toEqual(onTime.usual);
    expect(onTime.confidence).toBe('high');
  });

  it('moves the window to start today once a day late, same width, low confidence', () => {
    const usual = windowOf(predict(regular)).usual;
    const today = addDays(end, 1);
    const late = windowOf(predict(regular, [], today));
    expect(late.usual).toEqual(usual);
    expect(late.window.start).toBe(today);
    expect(diffDays(late.window.end, late.window.start)).toBe(diffDays(usual.end, usual.start));
    expect(late.confidence).toBe('low');
  });

  it('keeps moving forward while no period is logged', () => {
    const today = addDays(end, 26);
    const late = windowOf(predict(regular, [], today));
    expect(late.window.start).toBe(today);
    expect(late.daysLate).toBe(26);
  });
});
