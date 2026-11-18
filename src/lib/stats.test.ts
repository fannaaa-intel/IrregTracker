import { iqr, median, range, stdev } from './stats';

describe('median', () => {
  it('takes the middle value of an odd-length list', () => {
    expect(median([31, 28, 35])).toBe(31);
  });

  it('averages the two middle values of an even-length list', () => {
    expect(median([28, 30, 33, 29])).toBe(29.5);
  });

  it('does not reorder the input', () => {
    const lengths = [35, 28, 31];
    median(lengths);
    expect(lengths).toEqual([35, 28, 31]);
  });
});

describe('iqr', () => {
  it('uses interpolated quartiles', () => {
    // Q1 = 2.75, Q3 = 6.25 for 1..8
    expect(iqr([1, 2, 3, 4, 5, 6, 7, 8])).toBeCloseTo(3.5);
  });

  it('is 0 when every value is the same', () => {
    expect(iqr([28, 28, 28, 28])).toBe(0);
  });
});

describe('range', () => {
  it('is max minus min', () => {
    expect(range([30, 24, 41, 33])).toBe(17);
    expect(range([29])).toBe(0);
  });
});

describe('stdev', () => {
  it('is the sample standard deviation', () => {
    // Population stdev of this classic list is 2; sample stdev is sqrt(32 / 7).
    expect(stdev([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(Math.sqrt(32 / 7));
  });

  it('is 0 for a single value or identical values', () => {
    expect(stdev([28])).toBe(0);
    expect(stdev([30, 30, 30])).toBe(0);
  });
});

describe('empty input', () => {
  it.each([
    ['median', median],
    ['iqr', iqr],
    ['range', range],
    ['stdev', stdev],
  ])('%s throws', (_name, fn) => {
    expect(() => fn([])).toThrow(RangeError);
  });
});
