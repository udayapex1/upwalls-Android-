# UpWalls issues and proposed fixes

Audit date: 2026-08-31

Scope: analysis and remediation plan only. No feature changes or fixes have been implemented.

## Priority guide

- P0: blocks startup, release, or a critical user flow.
- P1: likely breaks an existing user flow or creates a security/data risk.
- P2: correctness, maintainability, or quality issue with a workaround.
- P3: cleanup or future hardening.

## Confirmed issues

### 1. Upload button points to a non-existent route — P1

Evidence: `app/(profileAction)/myUploads.tsx:132` navigates to `/(tabs)/upload`, but the upload screen is `app/(profileAction)/upload.tsx`.

Impact: the empty “Upload Now” state can fail typed-route compilation and may navigate to an invalid/not-found route at runtime.

Solution: change the navigation target to the existing profile-action upload route and verify both the empty state and dashboard upload action on a native build.

### 2. TypeScript build is failing — P0

Evidence: `npx tsc --noEmit` reports errors in the stale `app-example` template tree, `Constants.expoConfig.version`, the invalid upload route, the dashboard dynamic route helper, missing wallpaper like fields, and dynamic Ionicons names.

Impact: the project cannot pass a strict type-check, so route regressions and API model mismatches can reach release.

Solution:

1. Decide whether `app-example` is an intentional source tree. If it is unused, exclude/remove it from the TypeScript project safely; if retained, restore its missing template dependencies/files.
2. Read the app version through a type-safe Expo config API or a defined fallback instead of destructuring an unsupported `version` property from the inferred type.
3. Correct the invalid upload route.
4. Type dashboard route values as Expo Router `Href` values or use explicit route literals.
5. Add the API fields actually consumed by Trending/detail screens (`likes`, `likedBy`, and other response fields) to the wallpaper model, or normalize the API response before it reaches screens.
6. Type icon names as the Ionicons name type instead of casting arbitrary strings.
7. Run `npx tsc --noEmit` again until it passes.

### 3. Lint is failing — P2

Evidence: `npm run lint` reports 8 errors, primarily unescaped apostrophes/quotes in rendered text. It also reports 21 warnings.

Impact: CI/release checks that treat lint errors as fatal will fail. Warnings indicate unstable hook dependencies and dead code.

Solution: escape text characters in JSX, then address warnings in small groups: stabilize callbacks used by effects, include correct dependencies, remove unused state/handlers/imports, and remove the unused label in dashboard. Re-run lint after each group.

### 4. Upload multipart header may prevent uploads — P1

Evidence: `src/services/wallpapers.ts:221` explicitly sets `Content-Type: multipart/form-data` while sending `FormData`. Registration intentionally omits this header so the runtime can add the boundary.

Impact: some React Native/native backend combinations reject the request because the multipart boundary is missing.

Solution: omit the manual `Content-Type` header for the wallpaper upload request and let `fetch` generate it. Validate title, category, tags, file type, file size, and server error responses with a real Android/iOS upload.

### 5. Sensitive token is logged — P1

Evidence: `src/services/wallpapers.ts:37` logs the complete bearer token. Authentication/profile functions also log response data and profile objects.

Impact: tokens and personal data can appear in Metro, device, CI, or crash logs and allow account access if logs leak.

Solution: remove token and full-response logging. Use redacted diagnostics in development only, behind a debug logger that is disabled in production.

### 6. Authentication can remain locally valid after token expiry — P1

Evidence: `AuthContext` restores stored auth and keeps the token when `getUserProfile` fails; API services return empty arrays/null rather than distinguishing unauthorized responses.

Impact: an expired/revoked token can leave the UI showing a signed-in user while protected requests silently fail.

Solution: centralize Axios/fetch authentication handling, detect 401/403 responses, clear Secure Store and context state, and redirect to login only for protected flows. Keep transient network failures separate from invalid credentials so offline behavior is not mistaken for logout.

### 7. Shared wallpaper loading state has race conditions — P2

Evidence: `WallpapersContext` uses one `isLoading` state for both all-wallpaper and user-wallpaper requests. These requests can overlap when authentication changes.

Impact: one request can set loading false while the other is still running, causing premature empty/loading UI or inconsistent refresh behavior.

Solution: use separate loading states (`isLoadingAll`, `isLoadingUser`) or a request counter. Add cancellation/request identity checks so an older response cannot overwrite newer state.

### 8. Profile refresh effect can cause stale behavior — P2

Evidence: `TopNavbar` calls `refreshUser()` in a mount-only effect while reading `isAuthenticated` and `user`; several other effects have missing dependencies according to lint.

Impact: a navbar mounted before auth hydration may not refresh when auth becomes available. Effects may also capture stale functions/state.

Solution: make refresh behavior explicit in `AuthContext` or depend on stable auth state; use `useCallback` for context operations when they are effect dependencies. Avoid refreshing the profile from every navbar instance if multiple screens mount it.

### 9. Detail screen can throw on missing profile URL — P1

Evidence: `app/wallpapers/[id].tsx:428` calls `.replace(...)` on `(wallpaper as any)?.userProfile` without optional chaining on the property before `.replace`. Similar direct URL operations exist in Feed/Trending/profile image rendering.

Impact: a valid API response without a profile image can crash the detail or feed screen.

Solution: normalize image/profile URLs through one null-safe helper that accepts all supported response shapes and returns `undefined` when absent. Render placeholders when no URL exists.

### 10. API response shape is handled inconsistently — P1

Evidence: service code accepts several shapes (`data`, `wallpapers`, `posts`, `post`, direct object), while screens independently use `any` and fields such as `userProfile`, `userName`, `deviceSupport`, `likes`, and `likedBy` that are absent from `Wallpaper`.

Impact: backend shape changes can produce blank images, broken counts, or runtime crashes without a compile-time signal.

Solution: define response DTOs and one normalization layer in the service boundary. Convert image fields, author fields, counts, and dates into a stable `Wallpaper` model before storing them in context.

### 11. Wallpaper detail performs four speculative requests — P2

Evidence: `getWallpaperById` sequentially tries four endpoint patterns.

Impact: a missing wallpaper can cause four network waits, unnecessary backend load, and confusing logs. A server error may be hidden by fallback attempts.

Solution: confirm the backend contract and use one canonical endpoint. If fallback compatibility is required temporarily, restrict retries to 404 responses, add a timeout, and document removal criteria.

### 12. Delete endpoint spelling is a contract risk — P1

Evidence: delete uses `/api/wallpaper/deltePost/:id` (misspelled `deltePost`).

Impact: deletion will fail if the backend is corrected or if the client is pointed at a backend using the conventional spelling.

Solution: verify the deployed backend route. Then centralize the route constant and either correct both sides in a coordinated release or retain a documented compatibility fallback limited to 404 responses.

### 13. Delete/update response parsing assumes JSON — P2

Evidence: upload and delete call `response.json()` unconditionally.

Impact: an empty 204, HTML proxy error, or malformed response is reported as a JSON parsing failure rather than the actual operation result.

Solution: inspect status/content type before parsing, provide a safe parser, and return a consistent typed error object.

### 14. Update version comparison accepts malformed versions — P2

Evidence: `isUpdateAvailable` maps arbitrary dot-separated strings with `Number`, without validating `latestVersion` or handling prerelease/build metadata.

Impact: malformed backend data can compare as `NaN` or produce incorrect update decisions.

Solution: validate versions with a small semver-compatible parser, normalize missing segments, and treat invalid remote data as a failed update check.

### 15. Route startup files are inconsistent — P0/P2

Evidence: `package.json` uses `expo-router/entry`, while root `index.js` imports a missing `./App`. The repository also contains an `app-example` template tree that participates in TypeScript checking.

Impact: tooling, native builds, and future maintainers can use conflicting assumptions about the app entry point; stale template code already causes type errors.

Solution: keep only the intended Expo Router entry strategy, remove or explicitly exclude the template tree if unused, and verify `npx expo config`, development startup, Android build, iOS build, and web export.

### 16. Android permission configuration is redundant and overly broad — P1/P2

Evidence: `app.json` declares legacy external-storage permissions, multiple media permissions, duplicate `READ_MEDIA_IMAGES`, `READ_MEDIA_AUDIO`, and an unqualified `INTERNET` entry.

Impact: unnecessary permission prompts, Play Store policy risk, and inconsistent behavior across Android API levels.

Solution: let Expo plugins declare required permissions where possible. Keep only permissions required by the actual media-library workflow, verify Android 13+ behavior, and inspect the generated manifest after `expo prebuild`/native build.

### 17. Native media/download flows need platform testing — P1

Evidence: detail screen uses legacy File System APIs, Media Library permissions, and wallpaper-application/linking behavior; app config enables edge-to-edge and broad storage permissions.

Impact: downloads may work in Expo Go but fail in a release build or on newer Android/iOS permission models.

Solution: test fresh-install permission denial, limited photo access, repeated download, sharing, QR saving, and unsupported platform cases in release-like Android and iOS builds. Handle cancellation and already-granted permissions explicitly.

## Potential issues to verify

### 18. No request timeout or retry policy — P2

Axios/fetch calls can remain slow while the UI shows a spinner. Add a shared timeout, bounded retry policy for safe GET requests, and user-facing retry states. Do not blindly retry login, upload, or delete.

### 19. No pagination or server-side filtering — P2

The app downloads all wallpapers and performs category/trending/randomization locally. Large datasets will increase memory, startup time, and image loading cost. Verify expected dataset size; if it can grow, add pagination and server-side query parameters without changing existing screen behavior.

### 20. Image/file validation is incomplete — P1

Registration and upload accept picker URIs with minimal validation. MIME detection is based on the filename extension and can produce invalid types. Verify file size, actual MIME type, supported formats, dimensions/orientation, and cancellation cases before sending.

### 21. User-facing error states are incomplete — P2

Most service failures become empty arrays or generic alerts. This makes “no data” indistinguishable from network/server failure. Preserve an error state alongside each data set and provide retry actions while keeping the existing feature set unchanged.

### 22. Client-side leaderboard period selector does not affect the request — P2

`leaderboard.tsx` exposes weekly/monthly/all-time tabs but always fetches the same `/api/users/getUsers` response and locally sorts by `postCount`.

Impact: the period selector can display different labels without changing the data, which is misleading.

Solution: either connect each period to a supported backend query/metric or remove/disable the selector until the backend contract exists. This is a correctness fix, not a new feature.

### 23. Feed like interaction is visual only — P2

The feed contains double-tap heart animation and wallpaper like-related display, but no visible persistence request was found in the client service layer.

Impact: users may believe likes were saved when they disappear after reload.

Solution: verify whether liking is intentionally presentation-only. If likes are an existing backend feature, add the missing authenticated contract and optimistic/error handling; otherwise label the interaction accurately.

### 24. Production logging and error reporting are not separated — P3

Many screens log full objects, URLs, request details, and stack traces directly with `console`. Introduce a small environment-aware logger with redaction and a production error-reporting strategy before release.

## Recommended implementation order

1. Resolve entry-point/template ambiguity and make TypeScript pass.
2. Fix the invalid upload route and null-safe image handling.
3. Fix multipart upload headers and verify upload/delete contracts.
4. Remove sensitive logs and add consistent auth-expiry handling.
5. Stabilize context loading/request behavior and normalize API responses.
6. Resolve lint errors/warnings and validate Android/iOS permission/media flows.
7. Verify leaderboard periods, feed likes, pagination needs, and user-facing retry states against the backend.

## Verification checklist after implementation

- `npm run lint` passes.
- `npx tsc --noEmit` passes without excluding active source files.
- App starts through Expo Router in development and release-like builds.
- Guest browsing works; login/register/logout and expired-token behavior are correct.
- Upload works with image picker cancellation, permissions, large files, and network failure.
- My uploads opens the upload screen, refreshes after upload, and deletes correctly.
- Detail download/share/QR flows work on current Android and iOS permission models.
- Category, trending, feed, and leaderboard displays match backend data.
- No access token, password, or full personal/API response is written to logs.
