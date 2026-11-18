# Cycle Tracker — Project Plan

A private, offline period tracker for irregular cycles. Built with Expo (React Native + TypeScript).
Nothing leaves the phone: no account, no server, no analytics.

> Status: planning. Tick boxes in **Milestones** as work lands.

---

## 1. Goals

1. Make logging a period take **under 5 seconds**.
2. Give **honest predictions for irregular cycles**: a window plus a confidence level, never a single "due date".
3. Help her **notice patterns worth mentioning to a doctor**, without diagnosing anything.
4. Keep the data **private, encrypted, and backed up by her**.

## Non-goals (we chose to leave these out)

- Fertile window / ovulation / "safe days". These are unreliable with irregular cycles and risky if someone relies on them.
- Accounts, cloud sync, partner sharing.
- AI/ML predictions. A median-based window is just as good with one person's data and easier to trust.
- Streaks, badges, gamification.

---

## 2. Feature scope

### v1: Must-have
| Area | Feature |
|---|---|
| Logging | Tap a calendar day to mark a period day, with flow: spotting / light / medium / heavy |
| Logging | Backfill past months quickly (multi-select days) |
| Logging | Edit / delete any entry |
| History | List of cycles: start date, cycle length, period length |
| History | Stats: median, shortest, longest, variation |
| History | Bar chart of cycle lengths (last 12) |
| Prediction | Next-period **window** + confidence (low / medium / high) |
| Prediction | "Still learning" until 3 complete cycles exist |
| Prediction | "Day X of cycle" counter on Home |
| Tags | Tag a cycle (illness, travel, stress, medication, other) → excluded from predictions |
| Flags | Gentle notes for atypical cycles (see §6) |
| Privacy | Encrypted DB, optional app lock, export/import backup, delete-all |

### v1.5: Should-have
- Symptoms (cramps, headache, mood, bloating, acne, energy, sleep), each with a 1–3 severity
- Daily notes (free text)
- Local reminders: "window opens in 3 days", and "did your period start?" when late
- Doctor report: one-page PDF summary of the last 6–12 cycles
- Discreet mode: neutral app name/icon, notification text that doesn't mention periods

### Later
- Basal temperature / ovulation test logging (only if she wants it)
- Symptom pattern insights ("cramps usually start 1 day before")
- Pill / medication reminders
- Home-screen widget

---

## 3. Tech stack

| Need | Choice | Notes |
|---|---|---|
| Framework | Expo, latest stable SDK, TypeScript `strict` | Requires a dev build (not Expo Go) because of SQLCipher |
| Navigation | `expo-router` | File-based routes in `src/app` |
| Database | `expo-sqlite` with SQLCipher | Enable the `useSQLCipher` build flag (see §8) |
| DB key | `expo-secure-store` | 32-byte random key, generated on first launch |
| Random | `expo-crypto` | For key generation |
| App lock | `expo-local-authentication` | Face ID / fingerprint, PIN fallback |
| Notifications | `expo-notifications` | Local only, no push server |
| Backup | `expo-file-system` + `expo-sharing` + `expo-document-picker` | Encrypted export file |
| Dates | `date-fns` | Plus our own `LocalDate` helpers (see RULES) |
| Icons / elements | `react-native-svg` + `lucide-react-native` | Thin-line icons and decorative shapes |
| Fonts | `@expo-google-fonts/nunito` | Rounded, friendly, readable |
| Tests | `jest-expo` + `@testing-library/react-native` | Pure logic gets unit tests first |
| App updates | `expo-updates` (EAS Update) + EAS Build | The one network exception (CLAUDE.md §1.1); APK shared via Google Drive |

Not using: Redux, analytics SDKs, crash reporters, remote config, any network library.

---

## 4. Folder structure

```
cycle-tracker/
├── PLAN.md                 ← this file
├── CLAUDE.md               ← rules for anyone (human or AI) writing code here
├── README.md
├── docs/
│   ├── DESIGN.md           ← pink minimalist theme + elements
│   └── HEALTH_RULES.md     ← medical thresholds and their sources
├── assets/
│   ├── fonts/
│   └── images/
└── src/
    ├── app/                ← expo-router screens
    │   ├── (tabs)/
    │   │   ├── index.tsx       Home
    │   │   ├── calendar.tsx    Calendar
    │   │   ├── history.tsx     History & stats
    │   │   └── settings.tsx    Settings
    │   ├── log/[date].tsx      Day editor (modal)
    │   ├── cycle/[id].tsx      Cycle detail + tag
    │   ├── lock.tsx            App lock screen
    │   └── _layout.tsx
    ├── components/         ← shared UI (Button, Card, Chip, CycleRing, Blob…)
    ├── features/
    │   ├── logging/        ← hooks + UI for period days, flow
    │   ├── cycles/         ← cycle derivation
    │   ├── prediction/     ← window + confidence (pure functions)
    │   ├── flags/          ← health flag rules (pure functions)
    │   ├── symptoms/       ← v1.5
    │   ├── reminders/      ← v1.5
    │   └── backup/         ← export / import
    ├── db/
    │   ├── client.ts       ← open encrypted DB, verify cipher
    │   ├── migrations.ts   ← PRAGMA user_version migrations
    │   └── repositories/   ← the only place SQL lives
    ├── lib/
    │   ├── date.ts         ← LocalDate helpers ('YYYY-MM-DD')
    │   └── stats.ts        ← median, IQR, stdev
    └── theme/
        ├── tokens.ts       ← colors, spacing, radii, type
        └── index.ts
```

---

## 5. Data model

All dates are **local calendar dates** stored as `TEXT 'YYYY-MM-DD'`. No timestamps for health data.

```sql
-- v1
CREATE TABLE period_day (
  date        TEXT PRIMARY KEY,              -- 'YYYY-MM-DD'
  flow        TEXT NOT NULL CHECK (flow IN ('spotting','light','medium','heavy')),
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

CREATE TABLE cycle_tag (
  cycle_start TEXT PRIMARY KEY,              -- start date of the tagged cycle
  reason      TEXT NOT NULL CHECK (reason IN ('illness','travel','stress','medication','other')),
  note        TEXT,
  exclude     INTEGER NOT NULL DEFAULT 1     -- 1 = leave out of predictions
);

CREATE TABLE setting (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL                         -- JSON
);

-- v1.5
CREATE TABLE symptom (
  date     TEXT NOT NULL,
  type     TEXT NOT NULL,
  severity INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 3),
  PRIMARY KEY (date, type)
);

CREATE TABLE note (
  date TEXT PRIMARY KEY,
  body TEXT NOT NULL
);
```

**Cycles are derived, not stored.** They are computed from `period_day` every time, so editing a day can never leave cycles out of sync.

### Cycle derivation rules
1. Sort period days. Days with a gap of **≤ 2 days** between them belong to the same period. This tolerates a skipped log.
2. A period made **only of spotting** does not start a new cycle. It is shown on the calendar but ignored for cycle math.
3. A cycle runs from one period's first day up to the day before the next period's first day.
   `cycleLength = nextStart − start` (in days).
4. The latest cycle is **open** (no length yet); it drives "Day X of cycle".
5. Cycles shorter than 10 days are almost always a logging mistake. Show them, but ask her to confirm before they count.

---

## 6. Prediction & flags

### Prediction (`features/prediction`, pure function)
```
input:  closed cycles (newest first), tags, today
use:    last 12 closed cycles that are NOT excluded
n < 3   → state "learning"  (show day counter only)
center  = median(lengths)
spread  = n >= 4 ? max(ceil(IQR / 2), 2) : max(ceil((max - min) / 2), 3)
window  = [lastStart + center - spread, lastStart + center + spread]
confidence:
  high    n >= 6 and stdev <= 3
  medium  n >= 4 and stdev <= 7
  low     otherwise
late    = today > window.end   → "Your period is X days later than the usual range"
```
- Copy always says **"likely between"**, never "due on".
- Show the window on the calendar as a soft dashed band, not as filled days.

### Health flags (`features/flags`, pure function)
Each threshold and its source is listed in `docs/HEALTH_RULES.md`. Flags are **notes, not alerts**: no red, no alarm wording.

| Flag | Rule |
|---|---|
| Short cycle | a cycle ≤ 20 days |
| Long cycle | a cycle ≥ 36 days |
| Long period | a period ≥ 8 days |
| High variation | across the last 6 non-excluded cycles, max − min ≥ 8 days |
| No period 90 days | today − lastStart ≥ 90 and no period logged → suggest seeing a doctor |

Show one gentle card at a time on Home, dismissible, with a "Why am I seeing this?" link to an explanation screen.

---

## 7. Screens

| Screen | Content |
|---|---|
| **Home** | Cycle ring with "Day X", next-window text + confidence chip, "Log today" button, one flag card if any |
| **Calendar** | Month grid; period days filled pink, spotting as dot, predicted window as dashed band; tap → Day editor |
| **Day editor** (modal) | Flow selector (4 chips), "Not a period day" option; v1.5: symptoms, note |
| **History** | Stats row (median / range / variation), bar chart, cycle list with tag icons |
| **Cycle detail** | Dates, lengths, tag picker, include/exclude toggle |
| **Settings** | App lock, reminders (v1.5), discreet mode (v1.5), export, import, delete all, about / disclaimer |
| **Lock** | Biometric prompt, PIN fallback |
| **Onboarding** (3 cards) | What it does, privacy promise, "add your last few periods" backfill |

---

## 8. Privacy & security checklist

- [ ] SQLCipher build flag on for iOS and Android (`expo.sqlite.useSQLCipher`)
- [ ] Key generated with `expo-crypto`, stored in `expo-secure-store` (`WHEN_UNLOCKED_THIS_DEVICE_ONLY`)
- [ ] On every DB open run `PRAGMA cipher_version;`. If it returns empty, **stop with an error screen**: never run unencrypted
- [ ] No network use except app updates (`expo-updates`, CLAUDE.md §1.1 exception: app code only, never health data, 8 PM–12 AM or on tap); no analytics, ads, or crash SDKs in `package.json`
- [ ] Export file encrypted with a passphrase she chooses (AES-GCM, key derived via PBKDF2/scrypt)
- [ ] Import validates schema version and shows a preview before replacing data
- [ ] "Delete all data" wipes the DB, the key, and scheduled notifications
- [ ] App switcher snapshot is blurred when app lock is on
- [ ] Discreet notification text by default (v1.5)

---

## 9. Milestones

### M0: Project setup
- [x] `npx create-expo-app` with TypeScript, expo-router
- [x] ESLint + Prettier + TS strict
- [x] Theme tokens + Nunito font loaded
- [ ] Dev builds running on iOS simulator and Android emulator

### M1: Encrypted storage
- [x] SQLCipher flag + key service
- [x] `db/client.ts` with cipher verification
- [x] Migrations via `PRAGMA user_version`
- [x] `periodDayRepo` (upsert, delete, listBetween)

### M2: Core logic (test-first)
- [x] `lib/date.ts` LocalDate helpers + tests
- [x] `lib/stats.ts` median / IQR / stdev + tests
- [x] `features/cycles` derivation + tests (gaps, spotting, open cycle)
- [x] `features/prediction` + tests (learning, low/med/high, late)
- [x] `features/flags` + tests (each rule, boundary values)

### M3: Logging UI
- [x] Calendar month grid component
- [x] Day editor modal with flow chips
- [x] Backfill multi-select mode

### M4: Home + History
- [x] Cycle ring + day counter
- [x] Prediction window text + confidence chip
- [x] History stats, bar chart, cycle list
- [x] Cycle detail + tagging

### Release & updates (added Nov 18 at the owner's request, before the first APK)
- [x] `expo-updates`: auto check 8 PM–12 AM (phone clock) while open, max every 30 min → "New version ready · Restart"; Settings → Check for updates
- [x] CLAUDE.md §1.1 exception approved by the owner
- [x] `eas.json` preview profile (APK, channel `preview`); bundle ID `com.fannaaa.cycle`
- [x] Expo login, project linked (`@sersi07/cycle-tracker`), EAS Update url set
- [ ] First cloud APK → Google Drive
- [ ] Verify on her phone: app opens offline; a test update arrives between 8 PM and 12 AM

### Kind notes (added Nov 18 at the owner's request)
- [x] Optional daily local notification with a gentle, discreet phrase (Settings → Kind notes)
- [x] Off by default; times 8 AM / 12 PM / 6 PM / 9 PM; 14 days scheduled ahead, topped up on open
- [x] App icon without the alert badge; version 1.1.0 (versionCode 2) for the first shared APK
- [ ] Check on a phone: permission prompt, a note arrives at the chosen time, lock-screen text

### M5: Flags + onboarding
- [x] Flag cards + explanation screen
- [x] 3-card onboarding with backfill

### M6: Privacy features
- [ ] App lock + blur on background
- [ ] Encrypted export / import
- [ ] Delete all data

### M7: Polish & test with her
- [ ] Accessibility pass (labels, font scaling, contrast)
- [ ] Dark mode
- [ ] She uses it for 2 weeks → collect feedback → fix list
- [ ] **v1 done**

### Then v1.5: symptoms, notes, reminders, doctor report, discreet mode

---

## 10. Testing strategy

- **Unit tests** for everything in `lib/`, `features/*/` logic. These are pure functions, so aim for ~100% coverage there.
- Fixture histories in `src/features/__fixtures__/`: regular, irregular, very irregular, one long gap, lots of spotting, only 2 cycles.
- **Component tests** for the Day editor and Calendar.
- **Manual checklist** before each release: fresh install, backfill, airplane mode, kill & reopen, export → delete all → import, timezone change.

---

## 11. Open questions for her

- [ ] Reminders: yes / no? How many days before?
- [ ] Which symptoms matter to her?
- [ ] Does she want the doctor report?
- [ ] App name and icon. Should it be discreet from day one?
- [ ] Light pink only, or also dark mode early?
