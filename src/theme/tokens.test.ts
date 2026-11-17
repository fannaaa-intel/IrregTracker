import { darkColors, lightColors, type ColorToken, type Colors } from './tokens';

// WCAG 2.x relative luminance + contrast ratio.
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

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
      expect({ pair: `${fg} on ${bg}`, ratio: contrast(colors[fg], colors[bg]) >= 4.5 }).toEqual({
        pair: `${fg} on ${bg}`,
        ratio: true,
      });
    }
  });
});
