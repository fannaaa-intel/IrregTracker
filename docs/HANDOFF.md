# Handoff

Read this after PLAN.md, CLAUDE.md, docs/DESIGN.md and docs/HEALTH_RULES.md.

## Status (Nov 18, 2026)

| Milestone | State |
|---|---|
| M0 Setup | Done except "dev build running on a device" (no device run yet) |
| M1 Encrypted storage | Done; not yet verified on a real phone |
| M2 Core logic | Done |
| M3 Logging UI | Done (calendar, day editor modal, backfill) |
| M4 Home + History | Done |
| Release & updates | Done; Expo project linked, cloud builds work |
| M5 Flags + onboarding | Done |
| App icon + Kind notes | Done (notes on by default, surprise time 8 PM–12 AM) |
| M6 Privacy features | Done: app lock, encrypted backup/restore, delete all |
| M7 Polish | Accessibility + dark mode done; "she uses it for 2 weeks" is next |
| Her APK | **v1.2.0 / versionCode 3** from `kind-notes` (everything above) |

- GitHub `main` = up to Kind notes v1.1.0 (`c6a280e`); the owner pushes (Claude's pushes are
  blocked by the permission check). Local `kind-notes` has M6/M7 on top.
- Builds: `efcbae10` = v1.0.0 (default icon, test only), `523409ed` = v1.1.0 (test only).
  Runtimes differ per version, so EAS updates never cross between them.
- Typecheck, lint (0 warnings), Prettier and all tests pass; Android bundles with `npx expo export`.
- PLAN.md §8 privacy boxes are unticked until the encryption is checked on a real phone.

## UI/UX round 2 (Nov 18, EAS update on runtime 1.2.0)

- Opening redrawn (timeline.ts: bloom, ring, window, name, tagline, dots, exit; ~1.3 s).
- Welcome: 4 cards (new "Notice how you feel"), living pictures (`illustration-motion.ts`),
  drifting blobs, text rises in, sliding page pill, cards scroll on small phones. Settings →
  About → "See the welcome again".
- Home: greeting by hour, `PhaseChip`, ring sweep + today dot, `TodayCard` (replaces the lone
  Log today button), `NoteCard`, `DriftBlob`, `FadeIn` stagger, petal dots. Owner: **no pulse**.
- Ornaments (`Flower`, `Sparkle`) per DESIGN.md §4.8; `ScreenTitle` on Calendar/History/Settings.
- Day editor: icon cards per section + "Saved" note. Calendar: "Back to today".

## Her feedback round 1 (Nov 18, shipped as an EAS update on runtime 1.2.0)

- Feedback: late prediction stayed in October; she wanted ovulation, symptoms, a sex log with a
  heart and safer-sex reminders, a "1 day late" note, notifications, calendar swipe, filters and a
  monthly report. Research and sources are in docs/HEALTH_RULES.md.
- Prediction: `usual` = the history window (ring, late count, reminders); `window` = what's shown,
  moved to start today once late. Fertile days pause while late.
- `features/fertility/` (calendar method), `features/symptoms/`, `features/intimacy/`,
  `features/reports/` (month at a glance), `features/logging/filters.ts` + `LayerChips` (filters =
  legend), `MonthSwiper` (PanResponder, no new dependency).
- Migration 2 adds `symptom` and `intimacy`. Backups carry both; schema-1 backups still restore.
- Cycle reminders: `reminders/cycle-logic.ts` (pure plan), `cycle-scheduler.ts`, re-planned on open,
  on return to the app, and 1.5 s after any change. Delete all cancels them too.
- No native changes, so it ships over the air: she taps Settings → Check for updates (or it
  arrives between 8 PM and 12 AM).

## Release & updates: what's done (Nov 18)

- `src/features/updates/`: pure `logic.ts` (window, 30-min throttle, status text), `app-update.ts`
  (tiny store + check/download/restart), `hooks.ts` (`useAutoUpdateCheck` in the root layout),
  `UpdateBanner` (calm "New version ready · Restart", dismissible) and `UpdateRow` in Settings.
- Window uses the **phone's clock** (`localHour` in lib/date), not fixed Manila time, so it follows
  her if she travels. Same as Manila while she's in the Philippines.
- Settings screen now has App (updates) and About (not a medical device / not contraception).
- CLAUDE.md §1.1 exception approved with the precise wording (mentions IP + random install ID).
- Bundle ID `com.fannaaa.cycle` (Android + iOS), `versionCode` 1, `eas.json` preview = APK.
- Expo project linked (Nov 18): owner `sersi07`, project `@sersi07/cycle-tracker`, `projectId` and
  `updates.url` in app.json. Next: owner runs the first `eas build -p android --profile preview`.

## After the first install (Nov 18)

- **Bug found on the phone:** v1.2.0 showed "couldn't open its storage" on first launch.
  expo-sqlite's `withExclusiveTransactionAsync` opens a second connection without `PRAGMA key`.
  Fixed with `src/db/transaction.ts` (`runInTransaction`, same keyed connection). **Never use
  `withExclusiveTransactionAsync`**; the test DB now throws if anything does.
- If storage fails, the error screen now checks for an update at once (outside 8 PM–12 AM).
- Opening animation: `features/opening/` (ring + petal dots, ~0.8 s, Reduce motion = fade).
- Published as EAS updates to channel `preview`, runtime 1.2.0 (`9719bb67…` fix,
  `e4c1ed19…` fix + animation). Publish with:
  `npx eas-cli@latest update --channel preview --environment preview --platform android -m "…"`

## M6 + M7 (Nov 18)

- Backup (`features/backup/`): `crypto.ts` AES-256-GCM + PBKDF2-SHA256 (iterations stored in the
  file, header authenticated), `format.ts` strict validation + preview, `backupRepo` replaces all
  rows in one transaction. `app_lock` is device-only and never travels in a backup.
- App lock (`features/lock/`): off by default; on/off needs biometrics or phone PIN; relocks after
  30 s away (`LOCK_GRACE_MS`); FLAG_SECURE while on (hides recents, blocks screenshots).
- Delete all (`features/privacy/delete-all.ts`): cancel notes → `wipeDatabase()` (file + WAL, then
  key; stops before the key if the file delete fails) → `Updates.reloadAsync()`.
- To verify on a phone: backup → delete all → restore; lock relock after 30 s; notes arrive.

## App icon and kind notes (Nov 18)

- Icons are generated from `assets/branding/logo-no-badge.png` (the owner's logo with the "!"
  badge removed; `logo-source.png` is the original). Re-export at 1024 px if the logo changes.
- The first cloud build (`efcbae10…`, commit 677d65e, v1.0.0) has Expo's default icon and no
  notifications. It's for the owner's own testing only; her first APK is v1.1.0.
- Kind notes (`features/reminders/`): local notifications only (`expo-notifications`, no push
  token, no server). Phrases in `phrases.ts` must never mention periods/cycles (lock screen).
  Settings in `setting.kind_notes`. 14 days are scheduled ahead and topped up on every app open.
  **M6 "Delete all data" must call `cancelKindNotes()`** (PLAN.md §8).

## M5: what's done (Nov 18)

- Flags: `features/flags/copy.ts` holds the HEALTH_RULES.md card templates word for word, plus the
  "Why am I seeing this?" text (why / good to know / when to talk to a doctor), numbers imported
  from `thresholds.ts`. `pickFlag` shows the most important flag not yet dismissed. Dismissed IDs
  (`type:cycleStart`) live in `setting.dismissed_flags`, so a new occurrence shows again.
- FlagCard sits on Home under "Log today"; route `/flag/[type]` is the explanation screen.
- Onboarding: 3 cards (`features/onboarding/logic.ts`), shown only when `setting.onboarding_done`
  is unset **and** nothing is logged (so restores or existing installs skip it). "Add past
  periods" opens `/calendar?backfill=1`, which starts backfill mode. Skip / Not now also finish it.

## Original brief: Release & updates (agreed with the owner)

The owner's partner isn't nearby, so the app goes to her as an **APK through Google Drive**, with
**automatic updates between 8 PM and 12 AM** (Manila), copying the pattern of the owner's budget
tracker (`C:\Users\DELL\ojt-budget-tracker`, see its `src/features/updates/` and plan.md line ~151).
Reuse the logic, not that app's look.

1. Add `expo-updates` (EAS Update), `checkAutomatically: "NEVER"` in app.json, runtime = app version,
   channel `preview`. Auto check only 8 PM–12 AM local time while the app is open (at most every
   30 min) → download → calm "Update ready · Restart" prompt; Settings → "Check for updates".
2. **CLAUDE.md §1.1 needs one exception, and the owner wants to see the wording first.** Draft:
   "One exception (owner decision): app updates via expo-updates. It only downloads app code, never
   sends her data, checks only 8 PM–12 AM or when she taps Check for updates, and the app works fully
   offline without it." Update README ("no internet") and PLAN.md §8 to match.
3. Build the APK with **EAS Build in the cloud** (no local disk use): `eas.json` with a `preview`
   profile (`buildType: apk`, channel `preview`). The owner must run `npx eas-cli login` (Expo
   account) himself. The first APK must already include expo-updates, or it can never update.
4. Pick a real bundle ID before the first build (placeholder `com.cycletracker.app` in app.json).

## Decisions already made (don't relitigate)

- Day 1 = first non-spotting day; same period if ≤ 2 unlogged days between logged days.
- Prediction window rounds outward on a half-day median; sample stdev; type-7 quartiles.
- Tags exclude a cycle from predictions/variation only; short/long notes still show for it.
- Very short cycles (< 10 days) need "Yes, it's right" in Cycle detail before they count
  (`settingRepo.confirmShortCycle`).
- No date-fns (Intl for formatting). Week starts Sunday. Calendar pages up to 2 months ahead.

## Environment rules (important)

- **Never create or boot an Android emulator. Ask before any big download or disk use.** C: has
  ~15 GB free. Android SDK is at `E:\AndroidSDK` (`ANDROID_HOME`), Gradle cache at `E:\gradle-home`
  (`GRADLE_USER_HOME`). A local native build would also put 1–2 GB in `android/` on C:.
- Git and Node live on E:. In PowerShell first run:
  `$env:PATH = "E:\Download\Git\Git\cmd;E:\Code;" + $env:PATH`
- Don't edit files with Get-Content/Set-Content (PowerShell 5.1 breaks UTF-8). Use the editor tools.
- Commit messages with quotes: write them to a file and use `git commit -F <file>`.
- Tests: RTL v14 `render` / `fireEvent` are async (await them); don't call `unmount()` manually.
  Jest maps `@/` and lucide's CommonJS build in package.json.

## Running it

- Checks: `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm test`.
- Device (owner's phone over USB, run by the owner): `npx expo run:android --device`, then `npm start`.
