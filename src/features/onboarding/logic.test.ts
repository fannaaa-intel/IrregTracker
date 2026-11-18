import { ONBOARDING_CARDS, needsOnboarding } from './logic';

describe('needsOnboarding', () => {
  it('shows on a fresh install', () => {
    expect(needsOnboarding(false, 0)).toBe(true);
  });

  it('never shows again once finished or skipped', () => {
    expect(needsOnboarding(true, 0)).toBe(false);
  });

  it('skips when days are already logged', () => {
    expect(needsOnboarding(false, 1)).toBe(false);
  });
});

describe('onboarding cards', () => {
  it('has the welcome cards in order, ending on backfill', () => {
    expect(ONBOARDING_CARDS.map((card) => card.key)).toEqual([
      'welcome',
      'track',
      'privacy',
      'backfill',
    ]);
  });

  it('says fertile days are not contraception wherever they are mentioned', () => {
    for (const card of ONBOARDING_CARDS) {
      const text = [card.title, card.body, card.note ?? ''].join(' ');
      if (/fertile/i.test(text)) expect(text).toMatch(/not contraception|never contraception/);
    }
  });

  it('takes the cycle count from the thresholds', () => {
    expect(ONBOARDING_CARDS[3].body).toContain('once 3 cycles are logged');
  });

  it('keeps the wording calm and gender-neutral', () => {
    for (const card of ONBOARDING_CARDS) {
      const text = [card.title, card.body, card.note ?? ''].join(' ');
      expect(text).not.toMatch(/!|\bshe\b|\bher\b|\bwoman\b|\bgirl\b|\bboyfriend\b|\bhusband\b/i);
    }
  });
});
