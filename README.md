# Cycle Tracker

A private, offline period tracker designed for irregular cycles.
Expo (React Native + TypeScript) · encrypted on-device storage · no accounts, no internet.

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
