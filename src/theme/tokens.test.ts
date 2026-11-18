import { contrastRatio, WCAG_AA_TEXT } from '../lib/contrast';
import { darkColors, lightColors, type ColorToken, type Colors } from './tokens';

// Text/background pairs that must meet WCAG AA (4.5:1). See CLAUDE.md §6.2 and DESIGN.md §1.
const textPairs: [fg: ColorToken, bg: ColorToken][] = [
  ['text', 'bg'],
  ['textMuted', 'bg'],
  ['primary', 'bg'],
  ['notice', 'bg'],
  ['calm', 'bg'],
  ['onPrimary', 'primary'],
  ['primaryDeep', 'surfaceTint'],
  ['notice', 'noticeBg'],
  // Text on cards (M7 accessibility pass: Settings, backup and lock screens use these).
  ['text', 'surface'],
  ['textMuted', 'surface'],
  ['primary', 'surface'],
  ['notice', 'surface'],
  ['calm', 'surface'],
  ['text', 'surfaceTint'],
];

const palettes: [name: string, colors: Colors][] = [
  ['light', lightColors],
  ['dark', darkColors],
];

describe('theme tokens', () => {
  it('defines the same color tokens for light and dark', () => {
    expect(Object.keys(darkColors).sort()).toEqual(Object.keys(lightColors).sort());
  });

  it.each(palettes)('%s colors are 6-digit hex values', (_name, colors) => {
    for (const value of Object.values(colors)) {
      expect(value).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  it.each(palettes)('%s text colors meet WCAG AA contrast', (_name, colors) => {
    for (const [fg, bg] of textPairs) {
      const ratio = contrastRatio(colors[fg], colors[bg]);
      expect({ pair: `${fg} on ${bg}`, passes: ratio >= WCAG_AA_TEXT }).toEqual({
        pair: `${fg} on ${bg}`,
        passes: true,
      });
    }
  });
});
