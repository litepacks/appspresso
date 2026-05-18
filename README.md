# Appspresso — Capacitor + Vite + React + TypeScript template

A production-minded starter for **mobile (Android/iOS) and web**: UI follows **[shadcn/ui](https://ui.shadcn.com/)** patterns (Tailwind + `cva`; primitives are native HTML / small helpers, no Radix dependency), state **Jotai** (single `appStore`), server state **TanStack Query** (persist), API **Axios**, routing **React Router** (lazy + nested layouts), i18n **i18next**, native **Capacitor 7** with selected plugins.

## Requirements

- Node.js 20+ (compatible with Capacitor 7 CLI)
- **Android**: Android Studio + **JDK** (Gradle sync)
- **iOS**: Xcode + **CocoaPods** (`ios` platform and `pod install`)

## CLI (`appspresso`)

The package exposes the **`appspresso`** binary (Vite wrapper, project init, native shortcuts). Built with [cac](https://github.com/cacjs/cac) and [@clack/prompts](https://github.com/bombshell-dev/clack) for interactive flows.

```bash
npx appspresso --version
npx appspresso help
```

| Command | Purpose |
|---------|---------|
| `appspresso init [dir]` | **New:** scaffold an empty folder or integrate into an existing Vite/React app (interactive or flags / `appspresso.init.json`). |
| `appspresso dev` \| `build` \| `preview` | Run Vite in the current project; uses `appspresso.config.ts` when no `vite.config.*` exists. |
| `appspresso native sync` | Runs `npm run build`, then `cap sync`. Use `--skip-build` if the web bundle is already built. Extra args are passed to `cap sync`. |
| `appspresso native open android` \| `ios` | Opens the native IDE (`cap open …`). |
| `appspresso native run android` \| `ios` | `cap run …` (requires local toolchains). |
| `appspresso doctor` | Environment check (Node, Vite, Capacitor, `android/` / `ios/`) with colored output. |

### `appspresso init` and manifest

Configure package name, display name, app id, and folder layout before files are written:

```bash
# Interactive (TTY)
appspresso init my-app

# Non-interactive
appspresso init my-app -y --package-name @acme/my-app --app-id com.acme.myapp --with-capacitor

# Team template
appspresso init my-app --config ./appspresso.init.json --write-manifest
```

Example [`appspresso.init.json`](packages/cli-shared/schemas/init.v1.json) fields: `packageName`, `displayName`, `appId`, `paths.src`, `paths.public`, `capacitor`, `appspressoVersion`.

| Mode | When |
|------|------|
| **Scaffold** | Target folder is missing or empty (no `package.json`). |
| **Integrate** | `package.json` already exists — adds `appspresso`, scripts, and minimal `appspresso.config.ts`. |

Capacitor CLI is resolved from `node_modules` upward (monorepo-friendly). If `@capacitor/cli` is missing, install it in the app workspace.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

### Environment variables

Only `VITE_*` keys are exposed to the client (never put secrets there).

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Axios base URL (`src/api/http.ts`) |
| `VITE_SENTRY_DSN` | Optional telemetry (without DSN, logging only) |
| `VITE_GIT_SHA` | Optional build metadata |
| `VITE_FEATURE_FLAGS` | JSON object of booleans (`{"flagName":true}`); merged first, then optional URL overwrites same keys |
| `VITE_FEATURE_FLAGS_URL` | Optional HTTPS JSON GET; body must be a flat `{ string: boolean }` object |
| `VITE_ENABLE_DEBUG_PANEL` | In development, set to `"false"` to hide the Debug panel (default: visible) |
| `VITE_REVENUECAT_API_KEY_IOS` | RevenueCat **public** SDK key (iOS native builds) |
| `VITE_REVENUECAT_API_KEY_ANDROID` | RevenueCat **public** SDK key (Android native builds) |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | `tsc -b` + `vite build` → `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | Biome |
| `npm run test:run` | Vitest unit tests (excludes `src/test/integration`) |
| `npm run test:integration` | `build:lib` + Vitest against package output (`appspresso/...` alias → `dist-lib`) |
| `npm run test:integration:coverage` | Same integration suite + `dist-lib` coverage (with source maps) → `coverage-integration/` |
| `npm run test:integration:watch` | Integration tests in watch mode (build lib first) |
| `npm run build:lib` | Library output in `dist-lib/` (tsup) — publish or consume via `file:` / workspace |
| `npm run cap:sync` | `appspresso native sync` — web build + `cap sync` |
| `npm run cap:open:android` | `appspresso native open android` |
| `npm run cap:open:ios` | `appspresso native open ios` |
| `npm run demo:dev` | Build library, then run the **demo** Vite app |
| `npm run demo:build` | Build library, then build the demo app |
| `npm run doctor` | Same as `appspresso doctor` from the repo root. |
| `npm run ci:native:android` | `cap sync android` + `assembleDebug` (CI downloads `demo/dist` + `dist-lib` from the `build` job). |
| `npm run ci:native:ios` | `cap sync ios` + Xcode simulator build (CI downloads web assets from `build`; run `npm run demo:build` locally first). |
| `npm run e2e:native:android` | Maestro smoke: launch app + screenshot (requires emulator + [Maestro CLI](https://maestro.mobile.dev/) + debug APK installed). |
| `npm run e2e:native:ios` | Same Maestro flow on a booted iOS Simulator with the app installed. |
| `npm run create:sync-template` | Refresh `packages/create-appspresso/template` from `demo/` (run before publishing the CLI) |

### CI (GitHub Actions)

After `native-android` / `native-ios` build jobs, Maestro smoke E2E runs:

| Job | What it does |
|-----|----------------|
| `native-e2e-android` | Emulator + install debug APK artifact → `maestro test e2e/maestro` |
| `native-e2e-ios` | Simulator + install `.app` artifact → `maestro test e2e/maestro` |

Flows live in [`e2e/maestro/`](e2e/maestro/) (`launchApp`, wait for **Word practice**, `takeScreenshot`).

**Local E2E:** `brew install maestro` (macOS), build/install the app (`npm run ci:native:android` or `ci:native:ios`), start emulator/simulator, then `npm run e2e:native:android` or `e2e:native:ios`.

## Playbooks (`docs/playbooks`)

Short usage recipes ship beside the code: offline-first sync, push, deep links, IAP notes, and [**forms (RHF + Zod)**](docs/playbooks/forms.md) live under [`docs/playbooks/`](docs/playbooks/).

## Motion (page transitions)

Route body transitions use **[Motion](https://motion.dev/)** via `appspresso/motion`:

- Import **`AnimatedOutlet`** and use it in place of React Router’s `<Outlet />` inside the scrolling `<main>` (keep headers/tab bars outside so only content animates).
- Presets: `fade`, `fadeSlow`, `slideUp`, `slideDown`, `slideX`, `slideXReverse`, `fadeSlide`, `zoomIn`, `zoomOut`, `pop` — e.g. `preset="zoomIn"`. Animations are disabled when **`useReducedMotion`** is enabled.
- The library lists **`motion`** as a **peer dependency**; this repo installs it for the demo and tests. New apps from `create-appspresso` include `motion` in `dependencies` so Vite can bundle it.

## Keyboard and bottom tab bar

- **`useKeyboardState`** (`appspresso/hooks/useKeyboardState`): `visualViewport` on web; **`@capacitor/keyboard` 7.x** on native (falls back to the visible-viewport approach if the plugin is not installed).
- **`AppBottomTabShell`** **`hideWhenKeyboardOpen`**: slides the bottom bar off-screen when the keyboard is open; listeners are registered only when this prop is `true`.
- The same behavior can be wired from **`Layout`** via **`RouteHandle.hideTabBarWhenKeyboardOpen`** on route handles.

## Error boundaries

- **`ErrorBoundary`** (`appspresso/components/ErrorBoundary`): Renders errors through **`reportError`** (also `kind: "react.errorBoundary"` and React `componentStack`). Use **`variant="full"`** at the app root (default) or **`variant="inline"`** inside a layout so headers and tab bars stay visible. **`resetKeys`** clears the error when values change (e.g. route identity). Optional **`fallback`** render prop. Actions: **Try again** (reset state) and **Reload app**.
- **`OutletErrorBoundary`** (`appspresso/components/OutletErrorBoundary`): Resets on **`pathname`** / **`search`** changes; wraps **`AnimatedOutlet`** / **`Outlet`** in **`Layout`**, **`OnboardingLayout`**, and the demo shell.
- **`App`** and **`DemoShowcaseApp`** wrap the provider + router stack in a root **`ErrorBoundary`** so failures above the inner outlet still get a full-screen recovery UI.

## App events (command / event bus)

Lightweight pub/sub — a single typed event map instead of deep prop drilling:

- **`createAppEventBus<TEvents>()`** (`appspresso/lib/app-events`): `on`, `emit`, `clear`. If a listener throws, **`reportError`** runs (`kind: "appEvents.listener"`); other listeners still run. For events without payloads, use **`undefined`** as the value type in the map (`emit("x")` is enough).
- **`useAppEventSubscription(bus, name, handler)`** (`appspresso/hooks/useAppEventSubscription`): keeps `handler` in a ref; re-subscribes only when `bus` / `name` change.
- In the template, **`src/app/events.ts`**: `AppEventMap` + shared **`appEvents`** instance — centralize event names there; emit/listen via `appEvents.emit(...)` or the hook.

## Feature flags

- **`VITE_FEATURE_FLAGS`**: Local / build-time JSON (`{"betaFlow":true}`). Useful to disable risky features in store builds while enabling them on web or internal builds.
- **`VITE_FEATURE_FLAGS_URL`**: Optional GET; response body must be a flat `{ "key": boolean }` object. The `.env` map is read first; remote values **override the same keys**.
- **`loadRuntimeConfig`** (inside bootstrap): merges sources; **`getFeatureFlags()`**, **`isFeatureEnabled(key, default)`** (`appspresso/config`); React: **`useFeatureFlag`** (`appspresso/hooks/useFeatureFlag`) updates **`featureFlagsAtom`**.
- The URL endpoint is usually a public JSON file; it is not a substitute for secrets or licensing — keep critical checks on the server / store.

## Forms (`react-hook-form` + Zod)

Use **`appspresso/components/form`** with existing inputs:

- Wrap `useForm()` return with **`<Form {...methods}>`** (`FormProvider`).
- **`FormField`**, **`FormItem`**, **`FormLabel`**, **`FormControl`** (Radix `Slot`), **`FormMessage`** — same pattern as shadcn `Form`.
- Resolver: **`zodResolver`** from **`@hookform/resolvers/zod`**; schemas with **`zod`** (also a dependency of this package).
- Peers: **`react-hook-form`**, **`@hookform/resolvers`**. See [`docs/playbooks/forms.md`](docs/playbooks/forms.md).

## Starter app (`npm create appspresso`)

The published CLI package is **`create-appspresso`** (npm resolves `npm create appspresso` to that package). It shares **`@appspresso/cli-shared`** with `appspresso init`.

```bash
npm create appspresso@latest my-app
cd my-app
npm run dev
```

Options (also available on `appspresso init`):

```bash
npm create appspresso@latest my-app -- --appspresso ^0.0.0
npm create appspresso@latest my-app -- --with-capacitor
npm create appspresso@latest my-app -- --web-only
npm create appspresso@latest my-app -- --skip-install
npm create appspresso@latest my-app -- --config ./appspresso.init.json
npm create appspresso@latest my-app -- --package-name @acme/my-app --app-id com.acme.myapp -y
```

`--with-capacitor` adds `capacitor.config.ts`, native dependencies, and `cap:*` npm scripts. `--web-only` appends a short README note for web-first projects. These flags cannot be combined.

In this monorepo, test the CLI locally without publishing:

```bash
npm run create:sync-template   # copy demo → CLI template (placeholders)
npm create ./packages/create-appspresso my-app -- --appspresso file:/absolute/path/to/app-kit
```

Use an **absolute** `file:` URL for `appspresso` so npm can resolve the library. Run `npm run build:lib` in that repo when working against a git checkout (consumer expects `dist-lib` on the package).

Maintainers: change `demo/`, then run `npm run create:sync-template` and commit `packages/create-appspresso/template/`. `prepublishOnly` on `create-appspresso` runs the same sync before publish.

## Demo app (`demo/`)

**`demo/`** is the in-repo workspace copy of the starter: same layout as the scaffold, linked to the library via `"appspresso": "file:.."`. Use it while developing the template; keep it in sync with `npm run create:sync-template`.

```bash
npm run demo:dev
```

Requires a successful `build:lib` first (`demo:dev` runs it automatically).

## npm package / subpath imports (`appspresso`)

This repo is both a **sample app** and a **publishable package** (`"name": "appspresso"`). Shared code is produced with `npm run build:lib` into `dist-lib/` (ESM + `.d.ts`).

### Build

```bash
npm run build:lib
```

### Consume from another project

Local development example:

```json
{
  "dependencies": {
    "appspresso": "file:../app-kit"
  }
}
```

After publishing: install `appspresso` from your registry (`private: false`; use a scope if you prefer).

### Import examples

Subpaths mirror the source tree via `exports`:

```ts
import Home from "appspresso/pages/Home";
import { http } from "appspresso/api/http";
import { getEnvConfig } from "appspresso/config";
import { flushOutbox } from "appspresso/sync/sync.service";
import { appStore } from "appspresso/state/store";
import { Button } from "appspresso/components/ui/button";
import { runBootstrap } from "appspresso/app/bootstrap";
```

**Router / `route-tree`**: Not shipped in the package (app-specific lazy routes). The host app keeps its own `router.tsx` / `route-tree.ts` and imports pages as above.

### Consuming Vite app

- Prefer `moduleResolution`: `"bundler"` or `"NodeNext"`.
- Components use **Tailwind** classes: add compiled output to `tailwind.config` `content`, e.g. `./node_modules/appspresso/dist-lib/**/*.js` (or `../dist-lib/**/*.js` in this monorepo demo).
- **`__APP_VERSION__`**: Injected from `version` at library build time; the host app can override with Vite `define` if needed.

### Peer dependencies

`package.json` **peerDependencies** declare ranges for React, React Router, Jotai, TanStack Query, Axios, i18next, etc. Capacitor plugins must be available in the host app at compatible versions when you use native-heavy modules.

## Capacitor

```bash
npm run build
npx cap add android   # first-time setup
npx cap add ios
npx cap sync
npx cap open android
npx cap open ios
```

- `capacitor.config.ts`: `appId`, `appName`, `webDir` (`dist`), Splash / StatusBar.
- Dark mode status bar is updated via `setStatusBarTheme`; splash background is mainly controlled in `capacitor.config.ts` and `resources/splash.png` (Capacitor 7 has no runtime `SplashScreen.configure` API).

### Android / iOS identifiers

Gradle **applicationId** / **namespace** and Xcode **Bundle Identifier** should match `appId` (placeholder: `com.example.capacitorvitepoc`).

### Custom URL scheme (deeplink)

- Single source for scheme: `src/config/constants.ts` → `DEEPLINK_SCHEME` (`myapp`).
- Route map: `src/deeplink/deeplink.routes.ts` (`DEEPLINK_ROUTE_MAP`).
- **Universal Links / App Links are not included**; before store release add Android `intent-filter` and iOS **URL Types** for `myapp://` aligned with the constant above.

## SQLite and sync

- Native: `@capacitor-community/sqlite`, migrations in `src/db/migrations.ts`.
- Web: no real SQLite; status via `sqliteStatusAtom`.
- Offline queue: `src/sync/sync.service.ts` (native: `sync_outbox` table, web: `src/sync/web-outbox.ts`).

## IAP

- SDK: `@revenuecat/purchases-capacitor`, React: `RevenueCatProvider` + `useRevenueCat` / `useEntitlement` (`src/app/providers/RevenueCatProvider.tsx`, `src/hooks/useRevenueCat.ts`).
- Public keys: `VITE_REVENUECAT_API_KEY_IOS` / `VITE_REVENUECAT_API_KEY_ANDROID`; entitlement id: `src/config/appspresso.config.ts` → `revenuecat.entitlementId` (re-export `REVENUECAT_ENTITLEMENT_ID`).
- Legacy store product reference list: `IAP_PRODUCT_IDS` in `src/config/constants.ts` (dashboard mapping via RevenueCat).
- Playbook: [docs/playbooks/revenuecat.md](docs/playbooks/revenuecat.md) and [docs/playbooks/iap.md](docs/playbooks/iap.md).

## Notifications

- Local: `@capacitor/local-notifications` (`scheduleTestNotification` examples).
- Push: scaffolding around `@capacitor/push-notifications`; APNs/FCM and permissions are host-app concerns.
- Permissions: `src/services/permission-manager.service.ts`.

## Secure storage

- Native: `@aparajita/capacitor-secure-storage` (`src/services/secure-storage.service.ts`, session keys in `src/auth/session-store.ts`).
- Web dev: low-trust fallback — do not store sensitive tokens in production web clients.

## New product checklist

1. `package.json` `name` / description.
2. `capacitor.config.ts` `appId`, `appName`; Android Studio / Xcode IDs.
3. `DEEPLINK_SCHEME`, `deeplink.routes.ts`, native URL schemes.
4. `resources/icon.png`, `resources/splash.png`, splash colors.
5. `index.html` title / theme color; product prefix for `STORAGE_KEY_PREFIX` / `JOTAI_STORAGE` (`src/config/constants.ts`) to avoid collisions.
6. `VITE_*` env; telemetry project.
7. `npm run lint`, `npm run test:run`, `npm run build`, `npx cap sync`, device smoke test for deeplink + splash.

## Architecture notes

- Bootstrap: `src/app/bootstrap.ts` (telemetry, runtime, appearance, SQLite, sync, **splash hide last**).
- Provider order: `QueryProvider` → `StoreProvider` → … → `AuthProvider` → `RevenueCatProvider` → `I18nProvider` (`src/app/RootProviders.tsx`, used from `App.tsx`).
- **Debug panel**: `src/dev/DebugPanel.tsx` — only when `import.meta.env.DEV`; disable with `VITE_ENABLE_DEBUG_PANEL=false`.
- Biome: root `biome.json` (ignores `android/`, `ios/`, `dist/`, `dist-lib`).

## Documentation

Full architecture, flows, and philosophy: open [`docs/index.html`](docs/index.html) in a browser (static; no build step).

## Links

- [Capacitor workflow](https://capacitorjs.com/docs/basics/workflow)
- Mobile Vite: `base: './'` in `vite.config.ts`.
