# Handoff

Read this after PLAN.md, CLAUDE.md, docs/DESIGN.md and docs/HEALTH_RULES.md.

## Status (Nov 18, 2026)

| Milestone | State |
|---|---|
| M0 Setup | Done except "dev build running on a device" (no device run yet) |
| M1 Encrypted storage | Done; not yet verified on a real phone |
| M2 Core logic | Done |
| M3 Logging UI | Done (calendar, day editor modal, backfill) |
| M4 Home + History | Done on branch `m4-home-history`, **not merged or pushed** |
| Next | **Release & updates** (below), then M5 |

- `main` on GitHub (`fannaaa-intel/IrregTracker`) = M0–M3. Push only when the owner says so.
- 163 tests, typecheck, lint (0 warnings) and Prettier all pass; Android + iOS bundle with `npx expo export`.
- PLAN.md §8 privacy boxes are unticked until the encryption is checked on a real phone.

## Next: Release & updates (agreed with the owner)

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
