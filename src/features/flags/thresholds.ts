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

// Fertile-day estimate (owner decision, Nov 18, 2026; see docs/HEALTH_RULES.md). Values are
// cycle days, counted from day 1 = the first period day, unless noted.
/** First possible fertile day = shortest cycle − this. Calendar (Knaus–Ogino) method. */
export const FERTILE_FROM_SHORTEST = 18;
/** Last possible fertile day = longest cycle − this. Calendar (Knaus–Ogino) method. */
export const FERTILE_FROM_LONGEST = 11;
/** Earliest likely ovulation = shortest cycle − this (luteal phase up to ~16 days). */
export const OVULATION_FROM_SHORTEST = 16;
/** Latest likely ovulation = longest cycle − this (luteal phase at least ~12 days). */
export const OVULATION_FROM_LONGEST = 12;
/** The calendar method uses the most recent cycles; with fewer, the estimate is marked rough. */
export const FERTILE_CYCLES = 6;
