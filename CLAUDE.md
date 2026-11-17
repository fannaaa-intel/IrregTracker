# Project Rules

Rules for anyone writing code in this repo: you, a teammate, or an AI assistant.
(Claude Code reads this file automatically. For other tools, copy it to `AGENTS.md` or `.cursorrules`.)

Read `PLAN.md` for scope, `docs/DESIGN.md` for UI, `docs/HEALTH_RULES.md` for medical thresholds.

---

## 1. Privacy rules (never break these)

1. **No network.** Do not add `fetch`, axios, websockets, analytics, crash reporting, ads, remote config, or any SDK that phones home. If a library needs the internet, don't use it.
2. **Never run unencrypted.** The DB must be opened through `src/db/client.ts`, which verifies `PRAGMA cipher_version`. Never open SQLite directly anywhere else.
3. **Never log health data.** No `console.log` of dates, flows, symptoms, or notes, even in dev. Log IDs/counts only.
4. **The encryption key lives only in SecureStore.** Never put it in state, AsyncStorage, files, or logs.
5. **Exports are always encrypted** with a user passphrase.
6. Notification text must be **neutral by default** ("Reminder from Cycle", not "Your period is coming").

## 2. Health & wording rules

1. **Never show a single predicted date.** Always a window: "likely between Dec 3 and Dec 12".
2. **Never show fertility, ovulation, or "safe day" predictions** in v1/v1.5.
3. **Never diagnose.** Don't write "You have PCOS / amenorrhea / a problem". Write "This can be worth mentioning to a doctor."
4. Flags are calm: no red, no ⚠️, no exclamation marks. Use the `notice` color tokens.
5. Every medical threshold must come from `docs/HEALTH_RULES.md`. Don't hard-code numbers in UI; import them from `features/flags/thresholds.ts`.
6. The app must show (in Settings → About) that it is **not a medical device and not contraception**.
7. Wording is gender-neutral and doesn't assume a partner or pregnancy goals.

## 3. Date rules (most bugs come from here)

1. Health data uses **`LocalDate` strings `'YYYY-MM-DD'`**, not JS `Date` objects and not timestamps.
2. All date math goes through `src/lib/date.ts` (`addDays`, `diffDays`, `todayLocal`, `parse`, `format`). Don't call `new Date(...)` inside features or components.
3. Never use `toISOString()` to get "today". It's UTC and will be off by a day in many timezones.
4. Cycle length = `diffDays(nextStart, start)`. Day 1 of a cycle = the first period day.

## 4. Architecture rules

1. **Logic is pure.** `features/*/` logic files (cycles, prediction, flags, stats) take plain data and return plain data: no DB, no React, no `Date.now()`. Pass `today` in as an argument.
2. **SQL lives only in `src/db/repositories/`.** Components and hooks call repositories through hooks, never SQL.
3. **Cycles are derived, never stored.** Recompute from `period_day`.
4. Screens in `src/app/` stay thin: compose components and hooks, no business logic.
5. Feature folders own their hooks, components, and logic: `features/<name>/{logic.ts, hooks.ts, components/}`.
6. State: React state + context + a small `useLiveQuery`-style hook. Don't add Redux/MobX. Add Zustand only if there's a clear need.
7. Schema changes need a new migration step in `db/migrations.ts` (bump `user_version`). Never edit an old migration.

## 5. Code style

- TypeScript `strict: true`. No `any`; use `unknown` and narrow.
- Functional components + hooks only.
- Named exports (except expo-router screens, which need default exports).
- File names: `kebab-case.ts`; components: `PascalCase.tsx`.
- Union string types over enums: `type Flow = 'spotting' | 'light' | 'medium' | 'heavy'`.
- Keep files under ~200 lines; split when bigger.
- Prettier formatting; ESLint must pass with zero warnings.

## 6. UI rules

1. **Only use theme tokens** from `src/theme`. No raw hex colors, font sizes, or spacing numbers in components.
2. Text colors must meet WCAG AA (4.5:1). `petal`/`blush` pinks are **decorative only**, never for text.
3. Never use color alone to show meaning. Pair it with a shape, icon, or label (e.g. predicted days use a dashed outline *and* a label).
4. Touch targets ≥ 44×44 pt.
5. Every interactive element has an `accessibilityLabel`. Calendar days read like "December 3, period day, medium flow".
6. Support Dynamic Type / font scaling. Don't fix text heights.
7. Animations are subtle (≤ 250 ms) and respect "Reduce Motion".

## 7. Testing rules

1. Any change to `lib/` or `features/*/logic` **must** include or update unit tests.
2. Prediction and flag tests must cover boundary values (e.g. 20 vs 21 days, 35 vs 36).
3. Use fixtures from `src/features/__fixtures__/`. Don't invent ad-hoc histories inside tests.
4. `npm test` and `npm run typecheck` must pass before a commit.

## 8. Dependencies

- Prefer Expo SDK packages. Before adding anything new, check: Does it work offline? Is it maintained? Does it need a network permission? Is it necessary?
- Write down why each new dependency was added in the PR / commit message.

## 9. Git

- Small commits, present-tense messages: `add cycle derivation with spotting rule`.
- One milestone item per branch/PR where practical.
- Never commit real health data, exported backups, or `.env` files. Fixtures are made-up data.
