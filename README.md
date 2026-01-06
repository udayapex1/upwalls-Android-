# Up Walls

An Expo-based wallpaper app (file-based router) built with React Native and Expo. The app provides feeds, categories, trending screens, user auth, and wallpaper details with sharing and download features.

## Features

- File-based routing using `expo-router`
- Authentication (login/register)
- Browse wallpapers by feed, categories, and trending
- Wallpaper detail view with share/download options
- Example/demo app preserved in `app-example`

## Built With

- Expo (managed/native parts present)
- React Native
- `expo-router` for routing
- Axios for networking

# Up Walls

![expo](https://img.shields.io/badge/Expo-~54.0.30-4FA7FF)
![react-native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB)
![license](https://img.shields.io/badge/License-ADD%20LICENSE-lightgrey)

Up Walls is a modern, Expo-based wallpaper app built with React Native and Expo Router. It provides a clean browsing experience for wallpaper discovery: feeds, categories, trending lists, detailed wallpaper views, sharing, and downloads. The repository includes a preserved starter example in `app-example` and full native project folders for Android and iOS.

## Key Features

- File-based routing with `expo-router` and typed routes
- Authentication flow (login / register) and session management
- Browsing by feed, category, and trending
- Wallpaper detail view with share and download options
- Image handling and manipulation via `expo-image`, `expo-image-manipulator`
- Media and permissions support (`expo-media-library`, storage access)

## Tech Stack

- Expo SDK ~54
- React 19 / React Native 0.81.5
- expo-router for filesystem routing
- Axios for HTTP requests
- TypeScript for static typing

## Quick Start

Prerequisites:

- Node.js (recommended 18+)
- npm or yarn
- Expo CLI (optional): `npm install -g expo-cli`

Install and run locally:

```bash
git clone <your-fork-or-remote>
cd up-walls
npm install
npm run start
```

Run on a platform:

```bash
npm run android   # builds/runs on Android device/emulator
npm run ios       # builds/runs on iOS simulator (macOS only)
npm run web       # runs the web version
```

Available scripts (from package.json):

- `start` — `expo start`
- `android` — `expo run:android`
- `ios` — `expo run:ios`
- `web` — `expo start --web`
- `lint` — `expo lint`
- `reset-project` — `node ./scripts/reset-project.js` (moves starter into `app-example`)

## Configuration & Builds

This repository contains `eas.json` for EAS builds. To build production binaries with EAS:

```bash
npm install -g eas-cli
eas login
eas build -p android
eas build -p ios
```

Note: follow the Expo docs to configure credentials and `eas.json` for your project.

## Project Layout

- `app/` — Primary app source (screens, layouts) using `expo-router` (file-based routing)
- `app-example/` — Preserved starter/demo app
- `src/` — Shared business logic and UI
  - `src/components/TopNavbar.tsx` — top navigation bar component
  - `src/context/` — `AuthContext.tsx`, `WallpapersContext.tsx` (state providers)
  - `src/services/` — `auth.ts`, `wallpapers.ts` (API layer)
  - `src/utils/` — helpers such as `wallpaperFilter.ts`
- `assets/` — images and static assets (app icons, splash)
- `android/`, `ios/` — native folders for platform-specific configuration

For details, open the main folders in your editor and explore `app/` and `src/`.

## Development Notes

- Routing: drop screens into `app/` to expose routes via `expo-router`.
- Data & state: `WallpapersContext` manages wallpapers across screens.
- API: network calls live in `src/services`; update endpoints there.
- Permissions: Android permissions are configured in `app.json` under `android.permissions`.

## Environment & Secrets

No `.env` file was detected. If you need API keys, keep them out of version control and use environment variables (or Expo's `eas build` secret management for production builds).

## Contributing

Contributions are welcome. Suggested workflow:

1. Fork the repository and create a feature branch.
2. Keep changes focused and add tests where appropriate.
3. Run the linter and ensure type checks pass: `npm run lint`.
4. Open a PR with a clear description and screenshots where relevant.

Guides to add later (I can create these for you): `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and a `MAINTAINERS.md`.

## Screenshots / Demo

Place screenshots under `assets/images/` and reference them in this README or the repo description. Example assets already exist (app icon, splash) in `assets/images`.

## License

There is no license file in the repository. To make this project a true open-source product, add a license (MIT is a common choice). I can create a `LICENSE` file on request.

## Next Steps (optional)

- Add `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md`.
- Add a `LICENSE` (MIT) and update `package.json`.
- Add badges (CI, coverage) once CI is configured.

---

If you'd like, I can also open a PR that adds a MIT `LICENSE`, a `CONTRIBUTING.md`, and a polished `README.md` at the repo root. Tell me which items you'd like me to add next.
