import { addDays } from '../../lib/date';
import { irregular, regular } from '../__fixtures__/histories';
import { buildOverview } from '../cycles/overview';
import { cyclePhase, phaseName, phaseText } from './logic';

function phaseOn(fixture: typeof regular, offset: number) {
  const today = addDays(fixture.lastStart, offset);
  const o = buildOverview({ days: fixture.days, tags: [], confirmed: [] }, today);
  return cyclePhase(today, o.history.open, o.fertileStatus);
}

// regular: period offsets 0–4 (5 days), ovulation cycle days 12–16 (offsets 11–15),
// usual window offsets 26–30.
describe('cyclePhase', () => {
  it('is menstrual (known, not estimated) on logged period days', () => {
    expect(phaseOn(regular, 0)).toEqual({ phase: 'menstrual', estimated: false });
    expect(phaseOn(regular, 4)).toEqual({ phase: 'menstrual', estimated: false });
  });

  it('moves follicular → ovulation → luteal at the ovulation range (both ends)', () => {
    expect(phaseOn(regular, 5)?.phase).toBe('follicular');
    expect(phaseOn(regular, 10)?.phase).toBe('follicular');
    expect(phaseOn(regular, 11)?.phase).toBe('ovulation');
    expect(phaseOn(regular, 15)?.phase).toBe('ovulation');
    expect(phaseOn(regular, 16)?.phase).toBe('luteal');
    expect(phaseOn(regular, 30)).toEqual({ phase: 'luteal', estimated: true });
  });

  it('says "unclear" instead of guessing when cycles are irregular', () => {
    expect(phaseOn(irregular, 20)).toEqual({ phase: 'unknown', estimated: true });
    expect(phaseOn(irregular, 1)?.phase).toBe('menstrual');
  });

  it('says "unclear" once the period is late', () => {
    expect(phaseOn(regular, 31)?.phase).toBe('unknown');
  });
});

describe('phase words', () => {
  it('stay factual and calm', () => {
    for (const text of [...Object.values(phaseText), ...Object.values(phaseName)]) {
      expect(text).not.toMatch(/!|should|PCOS|disorder/i);
    }
    expect(phaseText.luteal).toContain('12 to 14 days');
  });
});
