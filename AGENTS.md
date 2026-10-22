# DigiClock — Project Context & Agent Instructions

## Project Overview
**DigiClock** is a cross-platform fullscreen digital desk clock for **Windows 10 Desktop** (via Electron `.exe`) and **Android Mobile** (via Expo Go / EAS `.apk`), modeled after the reference monitor photo in `assets/digiclock.png`.

### Core Visual & Functional Specs
- **Background**: Pure solid black (`#000000`), edge-to-edge fullscreen with no status bar or window menu bar.
- **Center Time (`HH:MM:SS`)**: Rendered in `DSEG7Classic-BoldItalic` (`assets/fonts/DSEG7Classic-BoldItalic.ttf`), dynamically sized via `useWindowDimensions()` to span **75% of screen width** (`(width * 0.75) / 6.0` to account for 6 digits × `0.816em` + 2 colons × `0.364em` + italic overhang so the ones place of seconds never clips).
- **Bottom-Center Date (`DAY - MONTH DATE, YEAR`)**: E.g., `WED - OCT 21, 2026`, rendered in `DSEG14Classic-Italic` at the bottom center (`bottom: '10%'`).
- **System Clock Sync**: `src/hooks/useSystemClock.ts` aligns every tick to the exact millisecond boundary of the next system second (`1000 - now.getMilliseconds()`). Supports 24-hour (default) and 12-hour formats.
- **Startup Color Config & Controls**: `src/components/StartupConfigModal.tsx` opens on startup to choose LED segment colors (default Digital Yellow `#E6E600`, presets in `src/constants/colors.ts`, or custom hex) and 12h/24h format. Top-right control chips in `src/components/DigitalClockDisplay.tsx` auto-hide after 3.5s of inactivity and reappear on tap or mouse move.
- **Wake Lock / Always-On**: Uses `expo-keep-awake` on mobile/web and Electron `powerSaveBlocker.start('prevent-display-sleep')` on Windows desktop.

### Key File Map
- `src/app/_layout.tsx` — Root Expo Router layout, loads `DSEG7` & `DSEG14` fonts, hides status bar.
- `src/app/index.tsx` — Main screen state (color, 12h/24h, auto-hide timer, Web & Electron fullscreen bridge).
- `src/components/DigitalClockDisplay.tsx` — Fullscreen clock UI, 75% width responsive typography, top-right quick bar.
- `src/components/StartupConfigModal.tsx` — Startup LED color & format configuration modal.
- `src/hooks/useSystemClock.ts` — Millisecond-aligned system clock synchronization hook.
- `src/constants/colors.ts` — Classic LED color presets and hex validation.
- `electron/main.cjs` & `electron/preload.cjs` — Native Windows desktop wrapper (local loopback static server for `dist/`, fullscreen management, `F11`/`Escape` shortcuts, display sleep blocker).
- `eas.json` — EAS Build configuration (`preview` profile builds a standalone Android `.apk`).

### Critical WSL2 & Windows 10 Desktop Packaging Gotchas
1. **Windows 10 UNC Path Sandbox Restriction**: Never launch `DigiClock.exe` directly from a WSL2 path (`\\wsl.localhost\...`) on Windows 10 — Chromium blocks the GPU/renderer sandbox over WSL2 network shares. Always copy the unpacked build to the native Windows filesystem (`/mnt/c/Users/godsw/Desktop/DigiClock/DigiClock.exe`), which `npm run desktop:build:win` does automatically.
2. **ASAR Static Unpacking**: `package.json` sets `"asarUnpack": ["dist/**/*"]` and `"!node_modules/**/*"`. `electron/main.cjs` resolves `app.asar.unpacked/dist` so the local HTTP server can serve static assets and fonts reliably.

---

This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npm run mobile:tunnel       # start Expo dev server with tunnel for Android over WSL2
npm run apk:build           # build standalone Android .apk via EAS Build
npm run desktop:build:win   # export web bundle, build Windows 10 .exe, and copy to C:\Users\godsw\Desktop\DigiClock
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
