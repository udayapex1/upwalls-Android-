# UpWalls project memory

Last analyzed: 2026-08-31

## Purpose

UpWalls is a React Native wallpaper discovery and sharing app. Users can browse wallpapers, filter them by category, view a wallpaper detail page, download/share images, register and log in, upload wallpapers, manage their uploads, and view a contributor leaderboard.

## Stack and configuration

- Expo SDK 54, React Native 0.81, React 19, TypeScript 5.9.
- Expo Router 6 with file-based routing and typed routes enabled.
- Axios for JSON API calls; native `fetch` for multipart uploads.
- React Context API for authentication and wallpaper data.
- Expo Secure Store for the JWT and serialized user object.
- Expo Image Picker/Manipulator, Media Library, File System, Sharing, QR Code SVG, Linear Gradient, Reanimated, and Ionicons.
- Package entry point is `expo-router/entry`; `index.js` still contains the older `registerRootComponent(App)` template and references a missing `App` module, so it is not the effective Router entry point.
- App metadata is in `app.json`; current configured version is `1.0.4`, Android package and iOS bundle identifier are `com.anonymous.upwalls`.
- Path alias `@/*` maps to the project root.

## App structure

The root layout wraps the entire router in `AuthProvider` and then `WallpapersProvider`.

### Routes

- `app/(tabs)/index.tsx`: explore/home feed, update prompt, wallpaper grid.
- `app/(tabs)/categories.tsx`: category browser.
- `app/(tabs)/trending.tsx`: locally sorts wallpapers using like-related fields.
- `app/(tabs)/feed.tsx`: randomized/social-style wallpaper feed with double-tap animation.
- `app/(tabs)/leaderboard.tsx`: fetches users and ranks the top four by `postCount`.
- `app/(auth)/login.tsx`, `app/(auth)/register.tsx`: authentication screens.
- `app/wallpapers/[id].tsx`: wallpaper detail, download/share, media-library access, QR code.
- `app/wallpapers/categories/[category].tsx`: category-specific wallpaper list.
- `app/(profileAction)/upload.tsx`: three-step image/details/review upload flow.
- `app/(profileAction)/myUploads.tsx`: authenticated user's uploads and delete action.
- `app/(profileAction)/dashboard.tsx`: user dashboard/statistics.
- `app/profile.tsx`: profile menu and account actions.
- `app/about.tsx`, `app/policy.tsx`, `app/report.tsx`, `app/check-update.tsx`: supporting screens.

Parenthesized directories are route groups and do not appear in the URL. The tab layout exposes Explore, Categories, Trending, Feed, and Leaderboard.

## State and data flow

### Authentication

`src/context/AuthContext.tsx` owns `user`, `token`, `isLoading`, and `isAuthenticated`. On mount it loads `token` and `user` from Secure Store and attempts to refresh the profile from the backend. Authenticated users visiting `(auth)` are redirected to `/(tabs)`. Unauthenticated users are intentionally allowed to browse; profile actions send them to login.

`src/services/auth.ts` implements login, registration, profile refresh, Secure Store reads, and logout cleanup. Registration requires a profile photo and sends multipart field `profile`. Profile data may be accepted either directly or nested under `user`.

### Wallpapers

`src/context/WallpapersContext.tsx` owns `allWallpapers` and `userWallpapers`, plus refresh, lookup, and delete operations. All wallpapers load on provider mount; user wallpapers load whenever authentication becomes true. `src/services/wallpapers.ts` reads multiple possible backend response shapes and filters the public list through `filterMobileWallpapers`.

The `Wallpaper` type currently includes `_id`, title/description, `image` or `wallpaperImage`, category, tags, uploader, and timestamps. Some screens also expect `likes` and `likedBy`, but those fields are not declared in the type.

## Backend contract

The active backend is:

`https://upwall-fullstack-e9qy.onrender.com`

Known endpoints used by the app:

- `POST /api/users/login`
- `POST /api/users/register` (multipart; profile image field is `profile`)
- `GET /api/users/myProfile` (Bearer token)
- `GET /api/users/getUsers`
- `GET /api/wallpaper/getAllPosts`
- `GET /api/wallpaper/myPost` (Bearer token)
- `POST /api/wallpaper/createPost` (multipart; image field is `wallpaperImage`, Bearer token)
- `DELETE /api/wallpaper/deltePost/:id` (note the backend path is spelled `deltePost` in this client)
- `GET /api/versioninfo/version?platform=android|ios`

The detail lookup tries four endpoint patterns because the backend response/route contract is uncertain. The update service fails safe and does not block the app if the version endpoint is unavailable.

## UI conventions

The visual system is centralized only lightly in `src/constants/color.ts`: white surfaces/background, slate text, pale borders, and blue accent. `TopNavbar` handles safe-area padding, branding, title/subtitle, and profile/login navigation. `Toast` is an animated bottom notification positioned above the tab bar.

## Baseline issues found

- `npm run lint` currently fails with 8 `react/no-unescaped-entities` errors in login, dashboard, my uploads, update, policy, and wallpaper detail screens. It also reports 21 warnings, mostly hook dependency and unused-variable issues.
- `npx tsc --noEmit` currently fails. Reported issues include stale/missing imports in an `app-example` Expo template tree, `Constants.expoConfig.version` typing, the invalid `/(tabs)/upload` route in `myUploads.tsx`, the dashboard's dynamic route helper, missing `likes`/`likedBy` fields on `Wallpaper`, and untyped dynamic Ionicons names in `about.tsx`.
- `app/(profileAction)/myUploads.tsx` navigates to `/(tabs)/upload`, but the actual upload screen is `/(profileAction)/upload.tsx`; this is a likely runtime navigation bug.
- `src/context/WallpapersContext.tsx` uses one shared `isLoading` flag for both all-wallpaper and user-wallpaper requests, so concurrent refreshes can overwrite each other's loading state.
- The upload request explicitly sets `Content-Type: multipart/form-data`; in React Native this can omit the boundary. Registration correctly leaves the header unset, so upload behavior should be checked if uploads fail.
- The client logs sensitive or noisy request data in several places, including the access token in `getUserWallpapers` and partial token/profile responses. Avoid expanding these logs in production.
- `filterMobileWallpapers` does not inspect image dimensions; it excludes explicit desktop/landscape wording and includes everything else by default.

## Development commands

```bash
npm install
npm start
npm run android
npm run ios
npm run web
npm run lint
npx tsc --noEmit
```

## Safe change guidance

Keep backend URL and endpoint spelling centralized in service modules. Reuse the two contexts instead of fetching the same wallpaper data directly from screens. Preserve route-group paths when using Expo Router, and verify generated typed-route errors after adding or renaming files. Before shipping, resolve the baseline lint/type errors and test authentication, image permissions, upload, download, delete, and update-check flows on a native build.
