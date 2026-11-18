import { contrastRatio, luminance } from './contrast';

describe('contrast', () => {
  it('gives the known extremes', () => {
    expect(luminance('#000000')).toBe(0);
    expect(luminance('#FFFFFF')).toBeCloseTo(1);
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21);
    expect(contrastRatio('#C2416E', '#C2416E')).toBe(1);
  });

  it('does not depend on argument order', () => {
    expect(contrastRatio('#3B2A31', '#FFF8FA')).toBeCloseTo(contrastRatio('#FFF8FA', '#3B2A31'));
  });

  it('matches the values documented in DESIGN.md', () => {
    expect(contrastRatio('#3B2A31', '#FFF8FA')).toBeCloseTo(12.9, 0);
    expect(contrastRatio('#C2416E', '#FFF8FA')).toBeCloseTo(4.7, 1);
  });

  it('rejects colors that are not #RRGGBB', () => {
    expect(() => luminance('#fff')).toThrow(RangeError);
    expect(() => luminance('pink')).toThrow(RangeError);
  });
});
