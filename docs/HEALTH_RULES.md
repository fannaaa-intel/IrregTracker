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
| `FERTILE_FROM_SHORTEST` | 18 days | First possible fertile cycle day = shortest cycle − 18 | Calendar (Knaus–Ogino) method; Mayo Clinic, Cleveland Clinic |
| `FERTILE_FROM_LONGEST` | 11 days | Last possible fertile cycle day = longest cycle − 11 | Calendar (Knaus–Ogino) method; Mayo Clinic, Cleveland Clinic |
| `OVULATION_FROM_SHORTEST` | 16 days | Earliest likely ovulation = shortest cycle − 16 | Luteal phase ~14 days (avg 13.7), commonly 12–16 |
| `OVULATION_FROM_LONGEST` | 12 days | Latest likely ovulation = longest cycle − 12 | Luteal phase ~14 days (avg 13.7), commonly 12–16 |
| `FERTILE_CYCLES` | 6 cycles | Recent cycles used; fewer than this → "rough estimate" | Family Planning Handbook (calendar method uses the 6 most recent cycles) |

## Wording templates

| Flag | Card text |
|---|---|
| Short cycle | "This cycle was shorter than usual (X days). One-off changes are common. If it keeps happening, it can be worth mentioning to a doctor." |
| Long cycle | "This cycle was longer than usual (X days). Stress, travel, and illness can all shift timing. If it keeps happening, it can be worth mentioning to a doctor." |
| Long period | "This period lasted X days. If periods often last 8 days or more, it can be worth mentioning to a doctor." |
| High variation | "Your cycle lengths have varied by X days recently. That's why your prediction window is wider. A doctor can help if you'd like to understand why." |
| No period 90 days | "It's been X days since your last logged period. If you're not pregnant and this is new for you, it's a good idea to check in with a doctor." |

## Fertile days and ovulation (owner decision, Nov 18, 2026)

v1 left fertile windows out. After her feedback ("para alam ni girl kung kelan ang possible
ovulation niya"), the owner asked for them. They are shown with these safeguards:

- **A range, never a day.** Possible fertile days use the calendar method with her own shortest
  and longest recent cycles, so the more her cycles vary, the wider (and more honest) the range.
  Likely ovulation days sit inside it (cycle length minus a 12–16 day luteal phase).
- **Only when there's a basis.** Needs the same 3 counted cycles as the period window. With fewer
  than 6, it's labelled a rough estimate. Hidden while her period is late (the cycle no longer
  matches her history) and when she turns it off in Settings.
- **Never contraception.** Every place it appears says so. The calendar method alone has a
  typical-use failure rate of about 1 in 4 per year. Only ~30% of people have their whole fertile
  window inside the textbook days 10–17 (Wilcox 2000), which is why her own cycles are used.
- **Neutral wording.** "Higher chance of pregnancy", without assuming she wants or doesn't want
  one, or that she has a partner.

Background: conception happens only from sex in a six-day span ending on ovulation day
(Wilcox 1995). Most cycle-length variation comes from when ovulation happens; the luteal phase
is steadier (about 14 days on average, though it varies between people).

## Late period

When today is past the end of the usual window and no period is logged, the window moves
forward to start today (same width) and confidence drops to low, as Clue and Fitbit do. The
card says how many days later than the usual range it is and asks her to log the first day if it
already started. The 90-day doctor note still applies.

## Safer sex wording

When she logs sex, the app shows one calm line: condoms are the only method that lowers the
chance of both pregnancy and STIs (CDC). If she logs it as unprotected, it adds that emergency
contraception can work up to 5 days after, and works best the sooner it's taken; a pharmacist or
doctor can help (ACOG). No judgement words, no exclamation marks.

## Sources

- NICHD, *What are menstrual irregularities?* https://www.nichd.nih.gov/health/topics/menstruation/conditioninfo/Pages/irregularities.aspx
- Natural Cycles, *Why was my cycle flagged as atypical or irregular?* https://help.naturalcycles.com/hc/en-us/articles/22906794904605-Why-was-my-cycle-flagged-as-atypical-or-irregular
- Epstein et al., UW 2017, period-tracking app user study: https://washington.edu/news/2017/05/02/period-tracking-apps-failing-users-in-basic-ways-study-finds
- Mayo Clinic, *Rhythm method for natural family planning*: https://www.mayoclinic.org/tests-procedures/rhythm-method/about/pac-20390918
- Cleveland Clinic, *Rhythm method*: https://my.clevelandclinic.org/health/articles/17900-rhythm-method
- Family Planning Handbook, *Calendar-based methods*: https://fphandbook.org/node/2629
- Wilcox, Weinberg, Baird, *Timing of sexual intercourse in relation to ovulation*, NEJM 1995: https://www.nejm.org/doi/full/10.1056/NEJM199512073332301
- Wilcox, Dunson, Baird, *The timing of the "fertile window"*, BMJ 2000: https://www.bmj.com/content/321/7271/1259
- Ovia study of ~98,000 people (average luteal phase 13.7 days), summary: https://ro.co/health-guide/research-ovia-study-fertility/
- Clue, *What happens if I forget to track my period?*: https://support.helloclue.com/hc/en-us/articles/7955531533844-What-happens-if-I-forget-to-track-my-period
- CDC, *Condom use: an overview*: https://www.cdc.gov/condom-use/index.html
- ACOG via AAFP, *Recommendations on emergency contraception*: https://www.aafp.org/pubs/afp/issues/2010/1115/p1278.html
- Acibadem, *Normal period cycle length*: https://acibademinternational.com/blog/normal-period-cycle-length-what-counts-as-regular-its-a-range/
