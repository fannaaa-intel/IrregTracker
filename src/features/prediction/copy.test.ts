import { addDays } from '../../lib/date';
import { onlyTwoCycles, regular } from '../__fixtures__/histories';
import { deriveCycles } from '../cycles/logic';
import { lateHint, learningText, lateText, windowText } from './copy';
import { predictNextPeriod, type Prediction } from './logic';

function windowPrediction(today: string): Extract<Prediction, { state: 'window' }> {
  const prediction = predictNextPeriod(deriveCycles(regular.days), [], today);
  if (prediction.state !== 'window') throw new Error('expected a window');
  return prediction;
}

describe('prediction copy', () => {
  const onTime = windowPrediction(regular.lastStart);

  it('always gives a window with "likely between", never a single due date', () => {
    const text = windowText(onTime, 'en-US');
    expect(text).toMatch(/^Likely between [A-Z][a-z]{2} \d{1,2} and [A-Z][a-z]{2} \d{1,2}$/);
    expect(text.toLowerCase()).not.toContain('due');
  });

  it('says nothing about lateness inside the window', () => {
    expect(lateText(onTime)).toBeNull();
  });

  it('counts late days past the window, with singular and plural', () => {
    const end = onTime.window.end;
    expect(lateText(windowPrediction(addDays(end, 1)))).toBe(
      'Your period is 1 day later than the usual range',
    );
    expect(lateText(windowPrediction(addDays(end, 4)))).toBe(
      'Your period is 4 days later than the usual range',
    );
  });

  it('explains the moved window only when late', () => {
    expect(lateHint(onTime, 'en-US')).toBeNull();
    const late = windowPrediction(addDays(onTime.window.end, 2));
    const hint = lateHint(late, 'en-US') ?? '';
    expect(hint).toContain('starts today');
    expect(hint).toContain('log its first day');
    expect(windowText(late, 'en-US')).toMatch(/^Likely between /);
  });

  it('explains how many cycles are still needed while learning', () => {
    const prediction = predictNextPeriod(
      deriveCycles(onlyTwoCycles.days),
      [],
      onlyTwoCycles.lastStart,
    );
    if (prediction.state !== 'learning') throw new Error('expected learning');
    expect(learningText(prediction)).toBe(
      'Still learning your cycle. 1 more complete cycle until a likely window can be shown.',
    );
  });
});
