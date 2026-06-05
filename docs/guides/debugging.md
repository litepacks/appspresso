# Debugging

## Debug panel

Visible when:

- `import.meta.env.DEV`, or
- `VITE_NATIVE_DEBUG=true` (debug APK builds)

Hidden when `VITE_ENABLE_DEBUG_PANEL` is `"false"`.

Shows bootstrap phase, network, sync pending count, SQLite status, and reset actions.

Build a native debug APK:

```bash
npm run ci:native:android:debug
```

## Native boot overlay

When `VITE_NATIVE_DEBUG=true`, a small overlay shows bootstrap `phase`, platform, elapsed ms, and Capacitor plugin availability during cold start.

## Stuck on splash

If bootstrap stays in `loading` for more than ~10s, a bottom bar appears with elapsed time and **Reload**.

After ~15s the app also force-hides the native splash (safety net).

## Bootstrap failures

If init fails, the app shows **Try again** / **Reload** (not a silent blank screen).

With `VITE_NATIVE_DEBUG=true`, the error message is shown on the failure screen.

Check console / logcat for `[info] bootstrap.startup` after successful boot.

## Android logcat

Install the debug APK, launch the app, and stream filtered logs:

```bash
npm run debug:android:logcat
# skip reinstall when APK is already on device:
node scripts/debug/android-logcat.mjs --skip-install
```

## Verify APK contents

```bash
npm run debug:android:verify-apk
appspresso native verify android
```

## CLI

```bash
appspresso doctor
appspresso info --map
appspresso native verify android
```

## Logs

`logger` in the library writes to console (`debug` only in dev).

Global errors go through `reportError` → telemetry (log-only without Sentry DSN).

## Clear local state

Debug panel → clear query cache / outbox / nuclear reset (dev or `VITE_NATIVE_DEBUG` builds).
