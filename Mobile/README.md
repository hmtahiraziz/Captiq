# Captiq AI — Mobile App

React Native app for AI-powered image scanning and captions. Connects to the [Backend API](../Backend/README.md).

## Stack

- **React Native** 0.86 + TypeScript
- **React Navigation** — auth + main tabs
- **TanStack Query** + **Zustand** — server state + local favorites
- **react-native-vision-camera** — live camera preview & capture
- **AsyncStorage** — offline scan history cache
- **NativeWind** — Tailwind-style styling

## Prerequisites

- [React Native environment](https://reactnative.dev/docs/set-up-your-environment) (Node, JDK, Android Studio or Xcode)
- Backend running at `http://localhost:3001` (see [Backend README](../Backend/README.md))

## Setup

```bash
cd Mobile
npm install
```

Copy env template if you add one later; API URL is configured in app config.

### Android (physical device)

Forward the backend port so the device can reach your machine:

```bash
adb reverse tcp:3001 tcp:3001
```

### Native rebuild (required after installing vision-camera)

Vision Camera includes native code. After `npm install`, rebuild the app:

```bash
npm run android
# or
npm run ios
```

Do **not** rely on Metro reload alone for native module changes.

## Run

```bash
# Terminal 1 — Metro
npm start

# Terminal 2 — device/emulator
npm run android
# or
npm run ios
```

If Metro fails to resolve vision-camera modules, clear cache:

```bash
npx react-native start --reset-cache
```

## Project structure

```
Mobile/
├── src/
│   ├── screens/          # Camera, History, Profile, Auth
│   ├── components/       # UI, scan, profile
│   ├── hooks/            # useScanCamera, useScans
│   ├── stores/           # Zustand (auth, favorites)
│   ├── lib/storage/      # AsyncStorage scan cache
│   └── navigation/
├── android/
├── ios/
└── metro.config.js       # Resolves vision-camera compiled lib/
```

## What not to commit

These are ignored via `.gitignore` (root + Mobile):

- `node_modules/`
- `.env` (API keys, secrets)
- `android/.gradle`, `android/.cxx`, `build/`
- iOS `Pods/`, `DerivedData`

Only commit `.env.example` templates, never real `.env` files.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Metro can't resolve `VisionCamera` | Run `npm start -- --reset-cache`; ensure `metro.config.js` is present |
| Live camera preview is black | Grant camera permission; full native rebuild (`npm run android`) |
| API requests fail on device | Run `adb reverse tcp:3001 tcp:3001` and start Backend |
| Gradle stuck on vision-camera CMake | Normal on first build; wait for completion |
