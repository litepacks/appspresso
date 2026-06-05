# Native blank (Capacitor smoke test)

Minimal Capacitor app to verify the **native shell** without Appspresso bootstrap, SQLite, or the demo bundle.

## What it checks

- `cap sync` / Gradle assemble
- WebView loads `dist/index.html`
- Splash auto-hide + `SplashScreen.hide()`
- Only 3 Capacitor plugins: `@capacitor/app`, `@capacitor/core`, `@capacitor/splash-screen`

## From monorepo root

```bash
npm run ci:native:android:blank
adb install -r examples/native-blank/android/app/build/outputs/apk/debug/app-debug.apk
```

Expected on device: dark screen, **“WebView OK”**, live clock. If this works but demo fails, the issue is in the demo JS bundle — not Capacitor/Android.

## Compare with demo

| | Native blank | Demo |
|---|---|---|
| App id | `com.example.appspresso.blank` | `com.example.capacitorvitepoc` |
| Plugins | 3 | 12+ (incl. SQLite) |
| Web bundle | ~few KB | ~600 KB+ entry |
| Appspresso bootstrap | No | Yes |
