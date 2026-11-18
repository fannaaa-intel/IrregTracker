// Every threshold the app uses, from docs/HEALTH_RULES.md (sources are listed there).
// Change a number here only together with the doc; thresholds.test.ts checks they match.
// All values are in days, except MIN_CYCLES_FOR_PREDICTION (a count of cycles).

/** Typical adult cycle lower bound. NICHD; ACOG. */
export const NORMAL_CYCLE_MIN = 21;
/** Typical adult cycle upper bound. NICHD; ACOG. */
export const NORMAL_CYCLE_MAX = 35;
/** A single cycle of this many days or fewer is atypically short. */
export const SHORT_CYCLE_FLAG = 20;
/** A single cycle of this many days or more is atypically long. */
export const LONG_CYCLE_FLAG = 36;
/** Bleeding that lasts this many days or more. */
export const LONG_PERIOD_FLAG = 8;
/** Cycle-to-cycle variation (max − min) of this many days or more. */
export const VARIATION_FLAG = 8;
/** Days since the last period start that suggest seeing a doctor. NICHD. */
export const NO_PERIOD_DAYS = 90;
/** Below this many counted cycles, the app shows "still learning". Product decision. */
export const MIN_CYCLES_FOR_PREDICTION = 3;
/** Cycles shorter than this are probably a logging mistake. Product decision. */
export const IMPLAUSIBLE_CYCLE = 10;
/** Up to this many unlogged days between two logged days still count as one period. */
export const PERIOD_MERGE_GAP = 2;
