# Handoff

Read this after PLAN.md, CLAUDE.md, docs/DESIGN.md and docs/HEALTH_RULES.md.

## Status (Nov 18, 2026)

| Milestone | State |
|---|---|
| M0 Setup | Done except "dev build running on a device" (no device run yet) |
| M1 Encrypted storage | Done; not yet verified on a real phone |
| M2 Core logic | Done |
| M3 Logging UI | Done (calendar, day editor modal, backfill) |
| M4 Home + History | Done, merged to `main` and pushed (Nov 18) |
| Release & updates | Code done on branch `release-updates`; owner still has to log in to Expo and build |
| M5 Flags + onboarding | Done on branch `m5-flags-onboarding` (stacked on `release-updates`), not pushed |
| Next | M6 Privacy features |

- `main` on GitHub (`fannaaa-intel/IrregTracker`) = M0–M4. Push only when the owner says so.
- Typecheck, lint (0 warnings), Prettier and all tests pass; Android bundles with `npx expo export`.
- PLAN.md §8 privacy boxes are unticked until the encryption is checked on a real phone.

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
