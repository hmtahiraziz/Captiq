# Captiq AI (AIScan)

Monorepo: React Native mobile app + Express backend for AI image scanning and captions.

## Repositories in this folder

| Folder | Description |
|--------|-------------|
| [Mobile](./Mobile/README.md) | React Native app (Android / iOS) |
| [Backend](./Backend/README.md) | Express API, PostgreSQL, OpenAI, Cloudinary |

## Quick start

1. **Backend** — `cd Backend && cp .env.example .env`, fill secrets, `npm install && npm run db:migrate && npm run dev`
2. **Mobile** — `cd Mobile && npm install && npm run android` (or `ios`)
3. **Device** — `adb reverse tcp:3001 tcp:3001` so the phone reaches localhost

## Git — what gets pushed

**Do commit:** source code, `package.json`, migrations, `.env.example`, configs.

**Do not commit:** `.env`, `node_modules/`, build folders (`dist/`, `android/build/`, `.cxx/`).




