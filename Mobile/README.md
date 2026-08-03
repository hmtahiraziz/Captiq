# Captiq AI — Mobile App

React Native app for AI-powered image scanning and captions. Connects to the [Backend API](../Backend/README.md).

## Stack

- **React Native** 0.86 + TypeScript
- **React Navigation** — auth + main tabs
- **TanStack Query** + **Zustand** — server state + local favorites
- **react-native-image-picker** — system camera capture & gallery pick
- **AsyncStorage** — offline scan history cache

## Prerequisites

- [React Native environment](https://reactnative.dev/docs/set-up-your-environment) (Node, JDK, Android Studio or Xcode)
- Backend running at `http://localhost:3001` (see [Backend README](../Backend/README.md))

## Setup

```bash
cd Mobile
npm install
```

### Android (physical device)

Forward the backend port so the device can reach your machine:

```bash
adb reverse tcp:3001 tcp:3001
```

## Run

```bash
# Terminal 1 — Metro
npm start

# Terminal 2 — device/emulator
npm run android
# or
npm run ios
```

## Scan flow

The scan screen shows a static viewfinder UI. Users pick an image via:

- **Capture photo** — opens the device system camera
- **Choose from gallery** — opens the photo library

There is no in-app live camera preview.

## Project structure

```
Mobile/
├── src/
│   ├── screens/          # Camera, History, Profile, Auth
│   ├── components/       # UI, scan, profile
│   ├── viewmodels/       # useCameraViewModel, useAnalyzingViewModel
│   ├── hooks/            # useScans
│   ├── stores/           # Zustand (auth, favorites)
│   ├── lib/storage/      # AsyncStorage scan cache
│   └── navigation/
├── android/
└── ios/
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
| Camera won't open | Grant camera permission in device Settings |
| Gallery picker fails | Grant photos/media permission in device Settings |
| API requests fail on device | Run `adb reverse tcp:3001 tcp:3001` and start Backend |
