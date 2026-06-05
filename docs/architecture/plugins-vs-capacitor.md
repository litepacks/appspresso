# Runtime plugins vs Capacitor plugins vs template

| Layer | Config | Examples |
|-------|--------|----------|
| **Capacitor native plugins** | `appspresso.config.ts` → `capacitor.plugins` | SplashScreen, SQLite, BackgroundRunner |
| **Appspresso runtime plugins** | `src/appspresso.plugins.ts` + `AppspressoHost` | Sentry, PostHog, auth adapters |
| **Template / pages** | Host `src/pages` | Demo screens (`appspresso/template/*`) |

Do not register Sentry or Firebase Auth under `capacitor.plugins`. Use `@appspresso/plugin-*` packages instead.
