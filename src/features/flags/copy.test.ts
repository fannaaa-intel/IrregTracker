import { addDays } from '../../lib/date';
import { latestCycleOf, latestPeriodOf, regular } from '../__fixtures__/histories';
import { deriveCycles } from '../cycles/logic';
import {
  FLAG_DISCLAIMER,
  FLAG_TYPES,
  flagExplanation,
  flagMessage,
  flagTitle,
  isFlagType,
} from './copy';
import { detectFlags } from './logic';

const firstFlag = (fixture: typeof regular, daysAfterStart = 3) =>
  detectFlags(deriveCycles(fixture.days), [], addDays(fixture.lastStart, daysAfterStart))[0];

describe('flag wording', () => {
  it('uses the HEALTH_RULES.md templates with the real day counts', () => {
    expect(flagMessage(firstFlag(latestCycleOf(20)))).toBe(
      'This cycle was shorter than usual (20 days). One-off changes are common. If it keeps happening, it can be worth mentioning to a doctor.',
    );
    expect(flagMessage(firstFlag(latestCycleOf(36)))).toMatch(
      /^This cycle was longer than usual \(36 days\)\./,
    );
    expect(flagMessage(firstFlag(latestPeriodOf(8)))).toBe(
      'This period lasted 8 days. If periods often last 8 days or more, it can be worth mentioning to a doctor.',
    );
    expect(flagMessage(firstFlag(regular, 90))).toMatch(
      /^It's been 90 days since your last logged period\./,
    );
  });

  it.each(FLAG_TYPES)('%s is calm: no exclamation marks and no diagnosis', (type) => {
    const texts = [flagTitle[type], ...Object.values(flagExplanation[type]), FLAG_DISCLAIMER];
    for (const text of texts) {
      expect(text).not.toMatch(/!/);
      expect(text).not.toMatch(/\byou have\b|\bdisorder\b|\bPCOS\b|\bamenorrhea\b/i);
    }
  });

  it('explains the thresholds behind each note', () => {
    expect(flagExplanation['short-cycle'].why).toContain('20 days or fewer');
    expect(flagExplanation['short-cycle'].why).toContain('21 to 35 days');
    expect(flagExplanation['long-cycle'].why).toContain('36 days or more');
    expect(flagExplanation['high-variation'].why).toContain(
      'last 6 counted cycles differ by 8 days',
    );
    expect(flagExplanation['no-period'].why).toContain('90 days or more');
  });

  it('recognises flag types from a route param', () => {
    expect(isFlagType('long-cycle')).toBe(true);
    expect(isFlagType('fertile')).toBe(false);
  });
});
