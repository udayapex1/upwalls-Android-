# UpWalls Comprehensive Technical Audit & Remediation Roadmap

**Audit Date:** 2026-08-31  
**Scope:** Static analysis, runtime failure modes, native layer integration, and architectural remediation plan for UpWalls mobile client and service boundaries.

---

## Priority Classification Matrix

- **P0 (Critical Blocker):** Blocks compilation, app startup, production release, or crashes core flows.
- **P1 (High Severity):** Breaks major user interactions, causes silent data loss, introduces security risks, or fails platform store policies.
- **P2 (Medium Severity):** Structural anti-patterns, race conditions, memory leaks, unhandled edge cases, or false UI states.
- **P3 (Low Severity / Tech Debt):** Cleanup, linting, dead code removal, and maintenance ergonomics.

---

## Section 1: Compilation, Entry Points & Tooling

### Issue 1: TypeScript Compilation Breakdown — P0
- **Evidence:** Running `npx tsc --noEmit` fails across several modules:
  - Stale `app-example` template tree participating in type checking.
  - `Constants.expoConfig.version` destructuring unsupported properties.
  - Invalid route string targets in navigation calls (`/(tabs)/upload`).
  - Missing API fields on the `Wallpaper` interface (`likes`, `likedBy`, `userProfile`, `deviceSupport`).
  - Dynamic untyped string casting for Ionicons names.
- **Root Cause:** Incomplete migration to typed routes in Expo Router, lack of shared API response contracts, and residual scaffold files.
- **Remediation Plan:**
  1. Remove or exclude `app-example` completely from `tsconfig.json`.
  2. Access version via a validated helper or fallback (`Application.nativeApplicationVersion` from `expo-application` or safe `expoConfig` resolution).
  3. Define explicit DTO interfaces (`WallpaperResponseDTO`, `UserDTO`) matching the actual backend responses before mapping to client state.
  4. Type route paths using Expo Router's `Href<string>` and strongly type icon names against `React.ComponentProps<typeof Ionicons>['name']`.

### Issue 2: Conflicting Startup Entry Points — P0
- **Evidence:** `package.json` points to `expo-router/entry`, while the root contains an unused/conflicting `index.js` attempting to import `./App`.
- **Root Cause:** Residual starter template configuration not aligned with Expo Router file-based conventions.
- **Remediation Plan:**
  - Standardize on `expo-router/entry` in `package.json`.
  - Remove redundant root entry scripts (`index.js`) to avoid ambiguity in native bundling (Metro / EAS Build).

### Issue 3: Lint Failures & Unstable Hooks — P2
- **Evidence:** `npm run lint` yields 8 fatal errors (primarily unescaped entities in JSX text like `'` and `"`) and 21 warnings (missing dependencies in `useEffect`, unused variables).
- **Remediation Plan:**
  - Escape all text entities using `&apos;`, `&quot;`, or proper string literals.
  - Wrap state callbacks referenced inside `useEffect` in `useCallback` or hoist state extraction to prevent stale closures.
  - Clean up unused imports and unreferenced labels in screen templates.

---

## Section 2: Security, Authentication & Session Lifecycle

### Issue 4: Sensitive Bearer Token Leak in Logs — P1
- **Evidence:** `src/services/wallpapers.ts:37` logs full `Authorization: Bearer <token>` strings. Auth services dump raw profile and response objects to stdout.
- **Impact:** Credentials leak into Metro logs, device crash dumps, and EAS build outputs, risking credential interception.
- **Remediation Plan:**
  - Strip all authorization header logging immediately.
  - Implement a conditional `Logger` wrapper that redacts tokens/PII and is completely disabled in `__DEV__ === false`.

### Issue 5: Stale Auth State & Ghost Sessions on 401/403 — P1
- **Evidence:** `AuthContext` hydrates cached tokens on boot. When downstream calls or `getUserProfile` fail with 401 Unauthorized, the context retains the token.
- **Impact:** The UI shows an authenticated state while all user-triggered network operations silently fail or return empty arrays.
- **Remediation Plan:**
  - Centralize request execution through an Axios or Fetch interceptor.
  - On receiving `401` or `403`, trigger an atomic session purge (`SecureStore.deleteItemAsync`), reset auth state, and route to login.
  - Explicitly distinguish between network drops (`status === 0` / timeout) and invalid credentials to prevent offline logouts.

### Issue 6: Static Bearer Header Initialization Anti-Pattern — P1
- **Evidence:** Token injection is either set globally once at startup or manually passed screen-by-screen.
- **Impact:** Login or logout operations fail to propagate tokens dynamically to subsequent requests without a full app restart.
- **Remediation Plan:**
  - Attach an asynchronous request interceptor that queries `SecureStore` or reads current memory state dynamically for every outgoing request.

---

## Section 3: Networking, Routes & Contracts

### Issue 7: Invalid Route Target in Upload Action — P1
- **Evidence:** `app/(profileAction)/myUploads.tsx:132` invokes `router.push('/(tabs)/upload')`, but the actual route is `app/(profileAction)/upload.tsx`.
- **Impact:** Empty state "Upload Now" button triggers unhandled route errors or navigates to a missing page.
- **Remediation Plan:**
  - Correct the route target to `/(profileAction)/upload` or `/upload`.
  - Validate with Expo Router's typed routing checks.

### Issue 8: Broken Multipart Form Boundary in Wallpaper Uploads — P1
- **Evidence:** `src/services/wallpapers.ts:221` sets explicit header `'Content-Type': 'multipart/form-data'`.
- **Impact:** Overriding this header strips the auto-generated multipart boundary delimiter (`boundary=----WebKitFormBoundary...`), causing native backends (e.g., Multer, Busboy) to reject the payload with `500` or `400 Bad Request`.
- **Remediation Plan:**
  - Remove manual `'Content-Type'` header on FormData uploads; allow the client network stack to calculate the payload boundary automatically.

### Issue 9: Speculative 4-Endpoint Fallback Cascade — P2
- **Evidence:** `getWallpaperById` sequentially executes up to 4 different endpoint patterns when resolving wallpaper details.
- **Impact:** Introduces high latency, burns client bandwidth, clutters backend access logs, and masks genuine server errors behind fallback failures.
- **Remediation Plan:**
  - Audit backend routes to establish the canonical single route (`/api/wallpaper/:id`).
  - Remove speculative cascading requests entirely.

### Issue 10: Delete Endpoint Spelling Mismatch (`deltePost`) — P1
- **Evidence:** Deletion URL is hardcoded as `/api/wallpaper/deltePost/:id`.
- **Impact:** Fragile endpoint contract that breaks if backend fixes the typo or runs on a standardized specification.
- **Remediation Plan:**
  - Centralize route constants in an `endpoints.ts` config.
  - Coordinate backend route alias (`/deletePost` and `/deltePost`) during deployment before deprecating the typo client-side.

### Issue 11: Inconsistent API Response Shapes & DTO Absence — P1
- **Evidence:** Service methods indiscriminately consume varying payload formats (`res.data`, `res.wallpapers`, `res.posts`), and screens use `any` casting.
- **Impact:** Missing payload properties produce silent render failures, `undefined` image paths, or runtime crashes.
- **Remediation Plan:**
  - Implement a validation/normalization layer in the service module.
  - Ensure all service methods return clean, predictable domain entities before passing data to UI Contexts.

### Issue 12: Unchecked JSON Parsing on Non-200 Responses — P2
- **Evidence:** Service endpoints invoke `response.json()` unconditionally.
- **Impact:** An HTTP 204 No Content, 502 Bad Gateway (HTML), or reverse proxy error results in unhandled syntax exceptions (`JSON Parse error: Unexpected token <`).
- **Remediation Plan:**
  - Check `response.ok` and content-type headers prior to parsing body.
  - Return structured error objects with HTTP status code and message.

### Issue 13: Flawed Version Comparison Logic — P2
- **Evidence:** `isUpdateAvailable` splits raw version strings and parses via `Number()`, ignoring semver metadata.
- **Impact:** Remote prerelease tags or uneven version numbers cause comparison failures or return `NaN`.
- **Remediation Plan:**
  - Replace manual string parsing with a light, robust semver comparator.

---

## Section 4: UI, State Synchronization & Native Systems

### Issue 14: Unhandled Null Values & Missing Protocol Sanitization on Images — P1
- **Evidence:** `app/wallpapers/[id].tsx:428` invokes `.replace()` on `(wallpaper as any)?.userProfile` without defensive checks.
- **Impact:** Crash on missing profile images; image loading failures on iOS under ATS (App Transport Security) when plain `http://` or relative URLs are returned.
- **Remediation Plan:**
  - Implement a centralized `resolveImageUrl(url?: string): ImageSourcePropType` helper that validates presence, handles relative paths, ensures secure HTTPS protocols, and returns reliable local fallbacks.

### Issue 15: Android Scoped Storage / API 34+ File System Write Crashes — P0
- **Evidence:** Direct file system writes for wallpaper downloads assume legacy external storage access without standard MediaStore routing.
- **Impact:** Immediate crash on Android 13+ / 14+ (`SecurityException` / `EACCES: permission denied`) due to strict Scoped Storage enforcement.
- **Remediation Plan:**
  - Download binary data first to `FileSystem.cacheDirectory` or `FileSystem.documentDirectory`.
  - Save to user gallery using `MediaLibrary.createAssetAsync(localUri)` and request granular permissions (`READ_MEDIA_IMAGES`) instead of legacy storage permissions.

### Issue 16: Redundant and Deprecated Android Permissions — P1
- **Evidence:** `app.json` declares deprecated `WRITE_EXTERNAL_STORAGE`, duplicate `READ_MEDIA_IMAGES`, and unqualified permissions.
- **Impact:** Triggers unnecessary Play Store privacy scrutiny and permission denial friction on modern Android devices.
- **Remediation Plan:**
  - Strip `WRITE_EXTERNAL_STORAGE` for Android API >= 33.
  - Clean `app.json` permissions array to include only specific, plugin-generated entries.

### Issue 17: WallpapersContext Concurrency & Shared Loading Race Condition — P2
- **Evidence:** A single `isLoading` boolean controls both global wallpaper feeds and user-specific uploads.
- **Impact:** Competing network requests overwrite state; an in-flight feed query may mark loading as false prematurely when a user upload query finishes.
- **Remediation Plan:**
  - Separate loading states: `isLoadingFeed` and `isLoadingUserPosts`.
  - Attach request IDs or cancellation tokens to prevent outdated network responses from overriding active state.

### Issue 18: Unmounted Component State Updates (Memory Leaks) — P2
- **Evidence:** Wallpaper detail screen triggers heavy media operations and multiple async calls without unmount guards.
- **Impact:** Memory leaks and React warnings when navigating back before network/image operations resolve.
- **Remediation Plan:**
  - Attach `AbortController` signals to fetch calls.
  - Abort in-flight requests in cleanup functions of `useEffect`.

### Issue 19: Missing Network Request Timeout & Retry Strategy — P2
- **Evidence:** Raw fetch calls lack explicit timeout thresholds.
- **Impact:** App hangs indefinitely on degraded network connections with persistent loading skeletons.
- **Remediation Plan:**
  - Configure standard 15-second request timeouts via `AbortSignal.timeout(15000)`.
  - Implement idempotent retry strategies limited strictly to safe GET operations.

### Issue 20: Missing Pagination & Unbounded Local Sorting — P2
- **Evidence:** The client loads the entire dataset into memory and executes client-side filtering, trending calculations, and randomizations.
- **Impact:** Memory exhaustion, rendering lag, and stutter on low-tier devices as catalog volume expands.
- **Remediation Plan:**
  - Establish cursor-based or offset pagination query parameters (`?page=1&limit=20`) on wallpaper endpoints.
  - Implement `onEndReached` infinite scrolling in FlatList.

### Issue 21: Client-Side Leaderboard Period Disconnect — P2
- **Evidence:** `leaderboard.tsx` displays weekly, monthly, and all-time filter tabs, but fetches the exact same endpoint without query parameters.
- **Impact:** Misleading user experience; tab selection produces identical rankings.
- **Remediation Plan:**
  - Wire period parameters to backend API (`/api/users/getUsers?period=weekly|monthly|all`) or disable selector until backend contract is deployed.

### Issue 22: Ephemeral Feed Like Interactions Without Persistence — P2
- **Evidence:** Double-tap heart animation executes locally on Feed items with no network dispatch to persist the like.
- **Impact:** Likes vanish immediately upon feed pull-to-refresh or navigation.
- **Remediation Plan:**
  - Implement authenticated like/unlike endpoint invocation with optimistic local state updates and rollback on error.

---

## Section 5: Phased Remediation Roadmap

```
Phase 1: Stabilization & Build (P0)
├── Eliminate app-example & redundant index.js
├── Define shared API DTO contracts
├── Normalize API response boundaries
└── Enforce clean TypeScript pass (npx tsc --noEmit)

Phase 2: Auth, Security & Network Core (P0 / P1)
├── Strip bearer token & sensitive logging
├── Centralize dynamic token injection
├── Implement 401 session eviction interceptor
└── Fix multipart/form-data boundary generation

Phase 3: Native Layer & Route Resilience (P1)
├── Correct myUploads navigation target
├── Rewrite download logic for Scoped Storage (MediaLibrary)
├── Clean app.json Android permissions
└── Add null-safe HTTPS image URI sanitizer

Phase 4: State Architecture & Concurrency (P2)
├── Split WallpapersContext loading states
├── Implement AbortController unmount cleanups
├── Consolidate wallpaper detail into 1 canonical endpoint
└── Add robust non-JSON response error handling

Phase 5: UX Polish & Contract Alignment (P2 / P3)
├── Add safe request timeouts (15s)
├── Connect leaderboard filters or disable stub UI
├── Wire persistent like endpoints
└── Resolve all remaining ESLint warnings
```

---

## Verification & Release Acceptance Criteria

- [ ] `npx tsc --noEmit` exits with status `0` across all source files.
- [ ] `npm run lint` exits with zero errors and zero warnings.
- [ ] Clean build and startup verified via Expo Router on Android (API 34+) and iOS.
- [ ] Guest mode functions cleanly without unauthorized exceptions.
- [ ] Expired tokens reliably trigger redirection to login without ghost UI states.
- [ ] Image uploads succeed across Android and iOS native builds.
- [ ] Media downloads successfully create assets in photo library without storage permission crashes.
- [ ] Terminal and device log streams contain zero tokens, credentials, or raw PII.
