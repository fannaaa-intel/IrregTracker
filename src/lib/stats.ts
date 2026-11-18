// Small, pure statistics helpers for cycle lengths. Inputs are never mutated.

function sortedCopy(values: readonly number[]): number[] {
  if (values.length === 0) {
    throw new RangeError('Needs at least one value.');
  }
  return [...values].sort((a, b) => a - b);
}

/**
 * Quantile by linear interpolation between closest ranks (the common "type 7" method, same as
 * Excel QUARTILE.INC and NumPy's default).
 */
function quantile(sorted: readonly number[], q: number): number {
  const position = (sorted.length - 1) * q;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
}

export function median(values: readonly number[]): number {
  return quantile(sortedCopy(values), 0.5);
}

/** Interquartile range: Q3 − Q1. */
export function iqr(values: readonly number[]): number {
  const sorted = sortedCopy(values);
  return quantile(sorted, 0.75) - quantile(sorted, 0.25);
}

/** max − min. */
export function range(values: readonly number[]): number {
  const sorted = sortedCopy(values);
  return sorted[sorted.length - 1] - sorted[0];
}

/**
 * Sample standard deviation (divides by n − 1), which is the more cautious choice for the few
 * cycles one person has. A single value has no spread, so it returns 0.
 */
export function stdev(values: readonly number[]): number {
  const sorted = sortedCopy(values);
  if (sorted.length === 1) return 0;
  const mean = sorted.reduce((sum, value) => sum + value, 0) / sorted.length;
  const squares = sorted.reduce((sum, value) => sum + (value - mean) ** 2, 0);
  return Math.sqrt(squares / (sorted.length - 1));
}
