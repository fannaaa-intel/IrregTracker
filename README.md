# Cycle Tracker

A private, offline period tracker designed for irregular cycles.
Expo (React Native + TypeScript) · encrypted on-device storage · no accounts.
The only internet use is checking for and downloading app updates (8 PM–12 AM, or from Settings).
Health data never leaves the phone, and the app works fully offline. See CLAUDE.md §1.1.

- **Plan & milestones:** [PLAN.md](PLAN.md)
- **Rules for writing code:** [CLAUDE.md](CLAUDE.md)
- **Design (pink minimalist):** [docs/DESIGN.md](docs/DESIGN.md)
- **Medical thresholds & sources:** [docs/HEALTH_RULES.md](docs/HEALTH_RULES.md)

> Not a medical device. Not contraception.

## Getting started (after M0)

```bash
npm install
npx expo run:ios      # or: npx expo run:android
npm test
npm run typecheck
```

A development build is required (not Expo Go) because the database uses SQLCipher.

## Releasing (APK through Google Drive)

Builds run in Expo's cloud (EAS Build), so nothing large is built on this PC.

```bash
npx eas-cli@latest login                       # once
npx eas-cli@latest build -p android --profile preview   # new APK (native changes, version bump)
npx eas-cli@latest update --channel preview -m "what changed"   # JS-only fix, reaches her phone 8 PM–12 AM
```

An update only reaches APKs with the same `version` in app.json (runtime = app version). Bump
`version` and `android.versionCode` only when a new APK is needed.
