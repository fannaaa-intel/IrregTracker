import {
  APPEARANCE_CHOICES,
  appearanceLabel,
  effectiveScheme,
  normalizeAppearance,
  THEME_FADE,
  toColorSchemeOverride,
} from './logic';

describe('appearance', () => {
  it('offers match phone, light and dark', () => {
    expect(APPEARANCE_CHOICES.map((c) => appearanceLabel[c])).toEqual([
      'Match phone',
      'Light',
      'Dark',
    ]);
  });

  it('falls back to matching the phone for unknown stored values', () => {
    expect(normalizeAppearance('dark')).toBe('dark');
    expect(normalizeAppearance(null)).toBe('system');
    expect(normalizeAppearance('sepia')).toBe('system');
  });

  it('maps choices to React Native overrides', () => {
    expect(toColorSchemeOverride('system')).toBe('unspecified');
    expect(toColorSchemeOverride('light')).toBe('light');
    expect(toColorSchemeOverride('dark')).toBe('dark');
  });

  it('resolves the scheme that will show', () => {
    expect(effectiveScheme('system', 'dark')).toBe('dark');
    expect(effectiveScheme('system', null)).toBe('light');
    expect(effectiveScheme('light', 'dark')).toBe('light');
    expect(effectiveScheme('dark', 'light')).toBe('dark');
  });

  it('keeps every step of the theme cross-fade at 250 ms or less', () => {
    for (const ms of Object.values(THEME_FADE)) expect(ms).toBeLessThanOrEqual(250);
  });
});
