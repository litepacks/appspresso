# First native run (Android)

Allow **30–60 minutes** the first time (Android Studio, SDK, emulator).

## Prerequisites

```bash
appspresso doctor
```

Fix Node, Vite, and **JDK 21** warnings before continuing.

## 1. Add platforms (if not done at init)

From the **demo** workspace (or repo root with `demo/`):

```bash
npx cap add android
# macOS only:
npx cap add ios
```

## 2. Build web bundle, sync, and assemble APK

**Monorepo (this repo):** the Capacitor app lives under `demo/`. Do **not** use root `npm run build` alone — it produces the wrong `dist/` for the demo APK.

```bash
# Full CI-like pipeline (recommended)
npm run ci:native:android

# Or step by step from demo/
cd demo
npm run android:apk
```

From repo root you can also run:

```bash
npm run android:sync
appspresso native assemble android
```

`android:sync` runs `demo:build` then `appspresso native sync android`.

Verify the web bundle and copied assets:

```bash
appspresso native verify android
```

## 3. Install on device / emulator

```bash
adb install -r demo/android/app/build/outputs/apk/debug/app-debug.apk
```

Or open Android Studio:

```bash
npm run cap:open:android
```

## 4. Troubleshooting

- **Splash stuck:** wait ~4s (native fallback hide). If still stuck, stream logs: `npm run debug:android:logcat`
- **White screen:** confirm `demo/dist/` exists and `appspresso native verify android` passes
- **Wrong app id:** check `app.id` in `demo/appspresso.config.ts`
- **Gradle errors:** use **JDK 21** (`JAVA_HOME`), open `demo/android/` in Android Studio and sync Gradle

Debug APK with boot overlay:

```bash
npm run ci:native:android:debug
```

See [Debugging](../guides/debugging.md) and [docs/troubleshooting.md](../troubleshooting.md).

## iOS (macOS)

```bash
npm run ci:native:ios
# or
npm run cap:open:ios
```

Run `pod install` under `ios/App` if Xcode reports missing pods.
