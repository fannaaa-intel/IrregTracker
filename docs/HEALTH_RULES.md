# Health Rules & Sources

Every threshold the app uses, with where it comes from. Code imports these values from
`src/features/flags/thresholds.ts`. If you change a number here, change it there too, and update the tests.

> The app is **not a medical device** and **not contraception**. It shows patterns and suggests when to talk to a doctor. It never diagnoses.

---

## Thresholds

| Constant | Value | Meaning | Source |
|---|---|---|---|
| `NORMAL_CYCLE_MIN` | 21 days | Typical adult cycle lower bound | NICHD; ACOG |
| `NORMAL_CYCLE_MAX` | 35 days | Typical adult cycle upper bound | NICHD; ACOG |
| `SHORT_CYCLE_FLAG` | ≤ 20 days | A single cycle is atypically short | Natural Cycles (ACOG-based) |
| `LONG_CYCLE_FLAG` | ≥ 36 days | A single cycle is atypically long | Natural Cycles (ACOG-based) |
| `LONG_PERIOD_FLAG` | ≥ 8 days | Bleeding lasted 8+ days | Natural Cycles; normal bleeding is ~2–7 days |
| `VARIATION_FLAG` | ≥ 8 days | Cycle-to-cycle variation beyond the 7–9 day "regular" range | ACOG; Natural Cycles |
| `NO_PERIOD_DAYS` | 90 days | No period for ~3 months (if not pregnant), worth seeing a doctor | NICHD (amenorrhea definition) |
| `MIN_CYCLES_FOR_PREDICTION` | 3 | Below this, show "still learning" | Product decision |
| `IMPLAUSIBLE_CYCLE` | < 10 days | Probably a logging mistake, so ask her to confirm | Product decision |
| `PERIOD_MERGE_GAP` | ≤ 2 days | Gap still counted as the same period | Product decision |

## Wording templates

| Flag | Card text |
|---|---|
| Short cycle | "This cycle was shorter than usual (X days). One-off changes are common. If it keeps happening, it can be worth mentioning to a doctor." |
| Long cycle | "This cycle was longer than usual (X days). Stress, travel, and illness can all shift timing. If it keeps happening, it can be worth mentioning to a doctor." |
| Long period | "This period lasted X days. If periods often last 8 days or more, it can be worth mentioning to a doctor." |
| High variation | "Your cycle lengths have varied by X days recently. That's why your prediction window is wider. A doctor can help if you'd like to understand why." |
| No period 90 days | "It's been X days since your last logged period. If you're not pregnant and this is new for you, it's a good idea to check in with a doctor." |

## Why no fertility predictions

Most cycle-length variation comes from when ovulation happens. The luteal phase stays fairly steady at about 12–14 days. With irregular cycles, ovulation day can't be predicted reliably from period dates alone, so the app doesn't show fertile windows.

## Sources

- NICHD, *What are menstrual irregularities?* https://www.nichd.nih.gov/health/topics/menstruation/conditioninfo/Pages/irregularities.aspx
- Natural Cycles, *Why was my cycle flagged as atypical or irregular?* https://help.naturalcycles.com/hc/en-us/articles/22906794904605-Why-was-my-cycle-flagged-as-atypical-or-irregular
- Epstein et al., UW 2017, period-tracking app user study: https://washington.edu/news/2017/05/02/period-tracking-apps-failing-users-in-basic-ways-study-finds
- Acibadem, *Normal period cycle length*: https://acibademinternational.com/blog/normal-period-cycle-length-what-counts-as-regular-its-a-range/
