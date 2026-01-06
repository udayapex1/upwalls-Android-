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

## Quick Start

Prerequisites:

- Node.js (recommended: 18+)
- npm or yarn
- expo CLI (optional): `npm install -g expo-cli`

Install and run locally:

```bash
npm install
npm run start
```

Open the app with the Expo dev tools, or run directly on a device/emulator:

```bash
npm run android   # builds/runs on Android device/emulator
npm run ios       # builds/runs on iOS simulator (macOS only)
npm run web       # runs the web version
```

Project helper scripts (from `package.json`):

- `start`: `expo start`
- `android`: `expo run:android`
- `ios`: `expo run:ios`
- `web`: `expo start --web`
- `lint`: `expo lint`
- `reset-project`: Moves starter code to `app-example` and creates a fresh `app` folder (`node ./scripts/reset-project.js`)

### EAS / Production Builds

This repository includes `eas.json` for configuring EAS builds. To use EAS you must install and configure the `eas-cli` and have an Expo account.

Example:

```bash
npm install -g eas-cli
eas build -p android
eas build -p ios
```

## Project Structure (overview)

- `app/` — Main app source using Expo Router (screens, routes, layouts)
- `app-example/` — Starter/example app preserved by the reset script
- `android/`, `ios/` — Native project files (custom native code / prebuilt)
- `src/` — Shared code (components, constants, context, services, utils)
  - `src/components/TopNavbar.tsx`
  - `src/context/` — `AuthContext`, `WallpapersContext`
  - `src/services/` — `auth.ts`, `wallpapers.ts` (API interactions)
- `assets/` — images and static assets
- `package.json`, `tsconfig.json`, `eas.json` — config and scripts

## Development notes

- Routing: add new screens under the `app/` folder to expose new routes with `expo-router`.
- State & data: `src/context` contains providers used across the app.
- API: `src/services` contains network logic (uses `axios`). Configure endpoints there.
- Linting: run `npm run lint`.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Open a pull request with a clear description

Please add tests and run the linter before submitting a PR.

## Environment / Secrets

No `.env` or secret management was detected in the repository. If you add API keys or secrets, do not commit them—use environment variables or secure storage (and add them to `.gitignore`).

## License

No license file found in the repository. Add a `LICENSE` file to declare one (e.g., MIT).

---

If you want, I can also:

- Add a minimal `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md`.
- Create a `LICENSE` file (MIT) and update `package.json`.
- Generate a short developer guide for adding routes and screens.

Updated README based on the project layout and `package.json` scripts.
